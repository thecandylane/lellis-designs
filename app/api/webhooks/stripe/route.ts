import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getPayload } from '@/lib/payload'
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  // In development without webhook secret, skip signature verification
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set - webhook signature verification disabled')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error('Order processing failed:', err instanceof Error ? err.message : String(err))
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const payload = await getPayload()

  // Retrieve the complete session to get all details
  const fullSession = await getStripe().checkout.sessions.retrieve(session.id)

  const metadata = fullSession.metadata || {}
  const email = metadata.email || fullSession.customer_email || ''
  const neededByDate = metadata.neededByDate || null
  const itemsJson = metadata.itemsJson || '[]'
  const shippingMethod = (metadata.shippingMethod as 'pickup' | 'ups') || 'pickup'
  const ambassadorCode = metadata.ambassadorCode || null

  let items = []
  try {
    items = JSON.parse(itemsJson)
  } catch {
    console.error('Failed to parse items JSON')
  }

  // Get shipping details from Stripe if it was a shipping order
  type ShippingInfo = {
    name?: string | null
    address?: {
      line1?: string | null
      line2?: string | null
      city?: string | null
      state?: string | null
      postal_code?: string | null
      country?: string | null
    } | null
  }
  const sessionWithShipping = fullSession as Stripe.Checkout.Session & {
    shipping_details?: ShippingInfo | null
    collected_information?: { shipping_details?: ShippingInfo }
  }
  const shippingDetails = sessionWithShipping.shipping_details || sessionWithShipping.collected_information?.shipping_details
  const shippingAddress = shippingDetails?.address ? {
    line1: shippingDetails.address.line1,
    line2: shippingDetails.address.line2,
    city: shippingDetails.address.city,
    state: shippingDetails.address.state,
    postal_code: shippingDetails.address.postal_code,
    country: shippingDetails.address.country,
  } : null
  const customerName = shippingDetails?.name || fullSession.customer_details?.name || null

  // Convert cents to dollars for the existing schema
  const totalCents = fullSession.amount_total || 0
  const shippingCostCents = fullSession.shipping_cost?.amount_total || 0
  const subtotal = (totalCents - shippingCostCents) / 100
  const shippingCost = shippingCostCents / 100
  const total = totalCents / 100

  // Define order type to help TypeScript
  type Order = {
    id: string
    customerEmail: string
    customerName?: string | null
    items: typeof items
    subtotal: number
    shippingCost: number
    total: number
    neededByDate?: string | null
    shippingMethod: 'pickup' | 'ups'
    shippingAddress?: typeof shippingAddress
  }

  let order: Order

  // Check if this is a custom order payment (order already exists)
  if (metadata.orderType === 'custom' && metadata.orderId) {
    // Update existing order instead of creating new
    const updatedOrder = await payload.update({
      collection: 'orders',
      id: metadata.orderId,
      data: {
        status: 'paid',
        stripeSessionId: session.id,
        // Add shipping address if collected
        ...(shippingAddress && { shippingAddress }),
        ...(customerName && { customerName }),
      },
    })

    // Update custom request status to 'production'
    if (metadata.customRequestId) {
      try {
        await payload.update({
          collection: 'custom-requests',
          id: metadata.customRequestId,
          data: { status: 'production' },
        })
      } catch (error) {
        console.error('Failed to update custom request status:', error)
      }
    }

    // Fetch the full order for email data
    order = {
      id: String(updatedOrder.id),
      customerEmail: String(updatedOrder.customerEmail || email),
      customerName: updatedOrder.customerName as string | null,
      items: (updatedOrder.items || []) as typeof items,
      subtotal: Number(updatedOrder.subtotal) || subtotal,
      shippingCost: Number(updatedOrder.shippingCost) || shippingCost,
      total: Number(updatedOrder.total) || total,
      neededByDate: updatedOrder.neededByDate as string | null,
      shippingMethod: (updatedOrder.shippingMethod as 'pickup' | 'ups') || 'pickup',
      shippingAddress: shippingAddress,
    }
  } else {
    // Standard order - create new
    const orderData = {
      stripeSessionId: session.id,
      customerEmail: email,
      customerName: customerName,
      neededByDate: neededByDate,
      items: items,
      shippingMethod: shippingMethod,
      shippingAddress: shippingAddress,
      shippingCost: shippingCost,
      subtotal: subtotal,
      total: total,
      status: 'paid' as const,
      ambassadorCode: ambassadorCode,
    }

    const newOrder = await payload.create({
      collection: 'orders',
      data: orderData,
    })

    order = {
      id: String(newOrder.id),
      customerEmail: email,
      customerName: customerName,
      items: items,
      subtotal,
      shippingCost,
      total,
      neededByDate,
      shippingMethod,
      shippingAddress,
    }
  }

  // Send emails (don't let email failures break the order)
  try {
    const emailData = {
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName || undefined,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      neededByDate: order.neededByDate || undefined,
      shippingMethod: order.shippingMethod,
      shippingAddress: order.shippingAddress ? {
        line1: order.shippingAddress.line1 || '',
        line2: order.shippingAddress.line2 || undefined,
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        postal_code: order.shippingAddress.postal_code || '',
      } : undefined,
    }

    // Send both emails in parallel
    await Promise.all([
      sendOrderConfirmation(emailData),
      sendAdminOrderNotification(emailData),
    ])
  } catch (emailError) {
    // Log but don't throw - order was created successfully
    console.error('Email sending failed:', emailError instanceof Error ? emailError.message : String(emailError))
  }
}
