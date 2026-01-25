import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

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
    let successCount = 0
    let errorCount = 0

    for (const id of ids) {
      try {
        await payload.update({
          collection: 'orders',
          id,
          data: { status },
        })
        successCount++
      } catch (error) {
        console.error(`Failed to update order ${id}:`, error)
        errorCount++
      }
    }

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
    console.error('Bulk status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    )
  }
}
