import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

type ReorderItem = {
  id: string
  sortOrder: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body as { items: ReorderItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Update all items in parallel
    await Promise.all(
      items.map((item) =>
        payload.update({
          collection: 'categories',
          id: item.id,
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder categories error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}
