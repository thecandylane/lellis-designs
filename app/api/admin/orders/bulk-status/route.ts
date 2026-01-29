import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { apiError } from '@/lib/api-response'
import { VALID_ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/constants'

type BulkStatusRequest = {
  ids: string[]
  status: OrderStatus
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BulkStatusRequest = await request.json()
    const { ids, status } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No orders selected' }, { status: 400 })
    }

    if (!status || !(VALID_ORDER_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const payload = await getPayload()

    // Batch update all orders in parallel using Promise.allSettled
    // to track successes and failures independently
    const results = await Promise.allSettled(
      ids.map(id =>
        payload.update({
          collection: 'orders',
          id,
          data: { status },
        })
      )
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const errorCount = results.filter(r => r.status === 'rejected').length

    // Log any errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to update order ${ids[index]}:`, result.reason)
      }
    })

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      message: `${successCount} order${successCount !== 1 ? 's' : ''} marked as ${ORDER_STATUS_LABELS[status].label.toLowerCase()}`,
    })
  } catch (error) {
    return apiError('Failed to update orders', error)
  }
}
