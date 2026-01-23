import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session)
    } catch (err) {
      console.error('=== CHECKOUT ERROR ===')
      console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err)
      console.error('Error message:', err instanceof Error ? err.message : String(err))
      console.error('Full error:', err)
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('=== HANDLING CHECKOUT ===')
  console.log('Session ID:', session.id)

  const payload = await getPayload()

  // Retrieve the complete session to get all details
  console.log('Retrieving full session from Stripe...')
  const fullSession = await stripe.checkout.sessions.retrieve(session.id)
  console.log('Full session retrieved successfully')

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

  // Create the order in Payload
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

  console.log('=== INSERTING ORDER ===')
  console.log('Order data:', JSON.stringify(orderData, null, 2))

  const order = await payload.create({
    collection: 'orders',
    data: orderData,
  })

  console.log('=== ORDER CREATED ===')
  console.log('Order ID:', order.id)

  // Send emails (don't let email failures break the order)
  try {
    console.log('=== SENDING EMAILS ===')
    console.log('Customer email:', email)
    console.log('Admin email:', process.env.ADMIN_EMAIL)

    const emailData = {
      orderId: String(order.id),
      customerEmail: email,
      customerName: customerName || undefined,
      items: items,
      subtotal,
      shippingCost,
      total,
      neededByDate: neededByDate || undefined,
      shippingMethod,
      shippingAddress: shippingAddress ? {
        line1: shippingAddress.line1 || '',
        line2: shippingAddress.line2 || undefined,
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postal_code: shippingAddress.postal_code || '',
      } : undefined,
    }

    // Send both emails in parallel
    const [customerResult, adminResult] = await Promise.all([
      sendOrderConfirmation(emailData),
      sendAdminOrderNotification(emailData),
    ])

    console.log('Customer email result:', customerResult)
    console.log('Admin email result:', adminResult)
    console.log('=== EMAILS SENT SUCCESSFULLY ===')
  } catch (emailError) {
    // Log but don't throw - order was created successfully
    console.error('=== EMAIL ERROR ===')
    console.error('Error type:', emailError instanceof Error ? emailError.constructor.name : typeof emailError)
    console.error('Error message:', emailError instanceof Error ? emailError.message : String(emailError))
    console.error('Full error:', emailError)
  }
}
