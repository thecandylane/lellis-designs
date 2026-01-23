import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

type Params = Promise<{ id: string }>

type ConvertRequest = {
  paymentMethod: 'stripe' | 'cash' | 'venmo' | 'other'
  shippingMethod?: 'pickup' | 'ups'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  // Check authentication
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body: ConvertRequest = await request.json()
  const { paymentMethod, shippingMethod } = body

  if (!paymentMethod) {
    return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
  }

  const payload = await getPayload()

  // Fetch the custom request
  let customRequest
  try {
    customRequest = await payload.findByID({
      collection: 'custom-requests',
      id,
    })
  } catch {
    return NextResponse.json({ error: 'Custom request not found' }, { status: 404 })
  }

  if (!customRequest) {
    return NextResponse.json({ error: 'Custom request not found' }, { status: 404 })
  }

  // Check if already converted
  if (customRequest.convertedOrderId) {
    return NextResponse.json({
      error: 'This request has already been converted to an order',
      orderId: typeof customRequest.convertedOrderId === 'object'
        ? customRequest.convertedOrderId.id
        : customRequest.convertedOrderId
    }, { status: 400 })
  }

  // Check status - must be approved or quoted
  if (!['approved', 'quoted'].includes(customRequest.status as string)) {
    return NextResponse.json({
      error: 'Request must be approved or quoted before converting to order'
    }, { status: 400 })
  }

  const quotedPrice = customRequest.adminSection?.quotedPrice
  const rushFee = customRequest.adminSection?.rushFee || 0
  const quantity = customRequest.orderDetails?.quantity || 1

  if (!quotedPrice && paymentMethod !== 'stripe') {
    return NextResponse.json({
      error: 'Quoted price is required for non-Stripe payments'
    }, { status: 400 })
  }

  // Determine shipping method from the custom request
  const deliveryPreference = customRequest.orderDetails?.deliveryPreference
  const finalShippingMethod = shippingMethod ||
    (deliveryPreference === 'ship' ? 'ups' : 'pickup')

  // Calculate totals
  const subtotal = quotedPrice || 0
  const shippingCost = finalShippingMethod === 'ups' ? 8 : 0
  const total = subtotal + rushFee + shippingCost

  // Create the order
  const orderData = {
    orderType: 'custom' as const,
    customRequestId: id,
    paymentMethod,
    customerEmail: customRequest.customerEmail,
    customerName: customRequest.customerName,
    customerPhone: customRequest.customerPhone,
    shippingMethod: finalShippingMethod,
    status: paymentMethod === 'stripe' ? 'pending' as const : 'paid' as const,
    items: [
      {
        buttonId: `custom-${id}`,
        name: `Custom Order - ${customRequest.designDetails?.description?.substring(0, 50) || 'Custom Buttons'}`,
        imageUrl: '',
        price: subtotal,
        quantity: quantity,
        notes: customRequest.designDetails?.description,
      },
    ],
    subtotal,
    shippingCost,
    total,
    neededByDate: customRequest.orderDetails?.neededByDate,
    notes: `Custom request converted to order.\n${rushFee > 0 ? `Rush fee: $${rushFee}\n` : ''}${customRequest.adminSection?.notes || ''}`,
  }

  let order
  try {
    order = await payload.create({
      collection: 'orders',
      data: orderData,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Update the custom request with the converted order ID
  try {
    await payload.update({
      collection: 'custom-requests',
      id,
      data: {
        convertedOrderId: order.id,
        // If paid via non-stripe method, move to production
        ...(paymentMethod !== 'stripe' && { status: 'production' }),
      },
    })
  } catch (error) {
    console.error('Error updating custom request:', error)
    // Don't fail the request, the order was created successfully
  }

  // If Stripe payment, create a payment link
  let paymentUrl: string | undefined
  if (paymentMethod === 'stripe' && quotedPrice) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(subtotal * 100),
              product_data: {
                name: `Custom Order - ${quantity} Buttons`,
                description: customRequest.designDetails?.description?.substring(0, 500) || 'Custom button order',
              },
            },
            quantity: 1,
          },
          ...(rushFee > 0 ? [{
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(rushFee * 100),
              product_data: {
                name: 'Rush Fee',
              },
            },
            quantity: 1,
          }] : []),
          ...(shippingCost > 0 ? [{
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(shippingCost * 100),
              product_data: {
                name: 'Shipping',
              },
            },
            quantity: 1,
          }] : []),
        ],
        customer_email: customRequest.customerEmail,
        metadata: {
          orderId: order.id,
          customRequestId: id,
          orderType: 'custom',
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`,
        ...(finalShippingMethod === 'ups' && {
          shipping_address_collection: {
            allowed_countries: ['US'],
          },
        }),
      })

      paymentUrl = session.url || undefined

      // Update order with stripe session ID
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          stripeSessionId: session.id,
        },
      })
    } catch (error) {
      console.error('Error creating Stripe session:', error)
      // Order was created but payment link failed - return partial success
      return NextResponse.json({
        success: true,
        orderId: order.id,
        warning: 'Order created but failed to create payment link',
      })
    }
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    ...(paymentUrl && { paymentUrl }),
  })
}
