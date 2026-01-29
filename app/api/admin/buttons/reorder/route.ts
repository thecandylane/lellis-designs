import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { apiError } from '@/lib/api-response'

type ReorderItem = {
  id: string
  sortOrder: number
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body as { items: ReorderItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload()

    // Batch update all items in parallel instead of sequential loop
    // This prevents N+1 queries (100 buttons = 100 DB calls -> 1 parallel batch)
    await Promise.all(
      items.map(item =>
        payload.update({
          collection: 'buttons',
          id: item.id,
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError('Failed to reorder buttons', error)
  }
}
