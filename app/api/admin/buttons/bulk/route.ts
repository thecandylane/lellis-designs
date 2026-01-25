import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

type BulkAction = 'feature' | 'unfeature' | 'hide' | 'show' | 'delete'

type BulkRequest = {
  ids: string[]
  action: BulkAction
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BulkRequest = await request.json()
    const { ids, action } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 })
    }

    if (!action || !['feature', 'unfeature', 'hide', 'show', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const payload = await getPayload()
    let successCount = 0
    let errorCount = 0

    for (const id of ids) {
      try {
        if (action === 'delete') {
          await payload.delete({
            collection: 'buttons',
            id,
          })
        } else {
          const updateData: Record<string, boolean> = {}

          switch (action) {
            case 'feature':
              updateData.featured = true
              break
            case 'unfeature':
              updateData.featured = false
              break
            case 'hide':
              updateData.active = false
              break
            case 'show':
              updateData.active = true
              break
          }

          await payload.update({
            collection: 'buttons',
            id,
            data: updateData,
          })
        }
        successCount++
      } catch (error) {
        console.error(`Failed to ${action} button ${id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      message: `${action} completed: ${successCount} successful, ${errorCount} failed`,
    })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}
