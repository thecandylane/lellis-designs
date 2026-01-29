import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { apiError } from '@/lib/api-response'

type BulkStatusRequest = {
  ids: string[]
  status: 'pending' | 'paid' | 'production' | 'ready' | 'shipped' | 'completed'
}

const validStatuses = ['pending', 'paid', 'production', 'ready', 'shipped', 'completed']

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

    if (!status || !validStatuses.includes(status)) {
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

    const statusLabels: Record<string, string> = {
      pending: 'pending',
      paid: 'paid',
      production: 'in production',
      ready: 'ready',
      shipped: 'shipped',
      completed: 'completed',
    }

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      message: `${successCount} order${successCount !== 1 ? 's' : ''} marked as ${statusLabels[status]}`,
    })
  } catch (error) {
    return apiError('Failed to update orders', error, {
      context: { status, orderCount: body?.ids?.length }
    })
  }
}
