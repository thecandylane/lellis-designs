import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { apiError } from '@/lib/api-response'

type Params = Promise<{ id: string }>

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

  // Check if there's a converted order
  const convertedOrderId = typeof customRequest.convertedOrderId === 'object'
    ? customRequest.convertedOrderId?.id
    : customRequest.convertedOrderId

  if (!convertedOrderId) {
    return NextResponse.json({
      error: 'This request does not have a linked order to cancel'
    }, { status: 400 })
  }

  // Fetch the order to verify its status
  let order
  try {
    order = await payload.findByID({
      collection: 'orders',
      id: convertedOrderId,
    })
  } catch {
    // Order might have been deleted already
    // Still update the custom request to clear the reference
    await payload.update({
      collection: 'custom-requests',
      id,
      data: {
        convertedOrderId: null,
        status: 'declined',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Order was already deleted. Request has been marked as declined.',
    })
  }

  // Only allow cancellation of pending orders (not yet paid)
  if (order.status !== 'pending') {
    return NextResponse.json({
      error: `Cannot cancel order with status "${order.status}". Only pending (unpaid) orders can be cancelled.`
    }, { status: 400 })
  }

  // Update request first, then delete order (safer order to prevent orphaned state)
  try {
    // Step 1: Update the custom request to clear order reference and mark as declined
    await payload.update({
      collection: 'custom-requests',
      id,
      data: {
        convertedOrderId: null,
        status: 'declined',
      },
    })

    // Step 2: Delete the order
    // If this fails, the request is correctly marked as declined
    try {
      await payload.delete({
        collection: 'orders',
        id: convertedOrderId,
      })
    } catch (deleteError) {
      // Request was updated but order deletion failed
      // This is less critical than the reverse (orphaned order with no request link)
      console.error('Failed to delete order after updating request:', deleteError)
      return NextResponse.json({
        success: true,
        warning: 'Request marked as declined but order deletion failed. Manual cleanup may be needed.',
        orderId: convertedOrderId,
      })
    }
  } catch (error) {
    return apiError('Failed to cancel order', error, {
      context: { requestId: id, orderId: convertedOrderId }
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Order cancelled and request moved to declined status',
  })
}
