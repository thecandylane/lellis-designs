import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { sendReadyForPickup, sendShippedNotification } from '@/lib/email'
import { createAuditLogger } from '@/lib/audit'

type Params = Promise<{ id: string }>

const validStatuses = ['pending', 'paid', 'production', 'ready', 'shipped', 'completed']

// Default pickup address - admin can override in the request
const DEFAULT_PICKUP_ADDRESS = process.env.PICKUP_ADDRESS || 'Baton Rouge, LA\n(Exact address will be coordinated via email)'

type StatusUpdateRequest = {
  status: string
  trackingNumber?: string
  pickupAddress?: string
  pickupInstructions?: string
}

async function handleStatusUpdate(
  request: NextRequest,
  { params }: { params: Params }
) {
  // Check authentication
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body: StatusUpdateRequest = await request.json()
  const { status, trackingNumber, pickupAddress, pickupInstructions } = body

  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const payload = await getPayload()

  // Fetch the order first to get customer info
  let order
  try {
    order = await payload.findByID({
      collection: 'orders',
      id,
    })
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Get client IP for audit log
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   'unknown'

  // Create audit logger for this request
  const audit = createAuditLogger(
    { id: String(user.id), email: user.email },
    clientIp
  )

  const previousStatus = order.status

  // Update the order status
  try {
    await payload.update({
      collection: 'orders',
      id,
      data: {
        status: status as 'pending' | 'paid' | 'production' | 'ready' | 'shipped' | 'completed',
        ...(trackingNumber && { trackingNumber }),
      },
    })

    // Audit log the status change
    audit.log('order.status_updated', 'orders', id, {
      previousStatus,
      newStatus: status,
      trackingNumber: trackingNumber || undefined,
      customerEmail: order.customerEmail,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  // Send appropriate emails based on status change
  try {
    if (status === 'ready' && order.shippingMethod === 'pickup') {
      // Send pickup ready email with address
      await sendReadyForPickup({
        orderId: String(order.id),
        customerEmail: order.customerEmail,
        pickupAddress: pickupAddress || DEFAULT_PICKUP_ADDRESS,
        pickupInstructions,
      })
    } else if (status === 'shipped' && trackingNumber) {
      // Send shipped email with tracking
      await sendShippedNotification({
        orderId: String(order.id),
        customerEmail: order.customerEmail,
        trackingNumber,
      })
    }
  } catch (emailError) {
    // Log but don't fail the status update
    console.error('Failed to send status email:', emailError)
  }

  return NextResponse.json({ success: true })
}

// Support both POST and PATCH methods
export const POST = handleStatusUpdate
export const PATCH = handleStatusUpdate
