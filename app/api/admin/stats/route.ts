import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload()

    const [
      activeOrdersResult,
      newRequestsResult,
      activeButtonsResult,
      featuredButtonsResult,
      activeCategoriesResult,
      unreadContactsResult,
    ] = await Promise.all([
      // Active orders (paid, production, ready, shipped)
      payload.count({
        collection: 'orders',
        where: { status: { in: ['paid', 'production', 'ready', 'shipped'] } },
      }),
      // New custom requests
      payload.count({
        collection: 'custom-requests',
        where: { status: { in: ['new', 'contacted'] } },
      }),
      // Active buttons
      payload.count({
        collection: 'buttons',
        where: { active: { equals: true } },
      }),
      // Featured buttons
      payload.count({
        collection: 'buttons',
        where: { featured: { equals: true } },
      }),
      // Active categories
      payload.count({
        collection: 'categories',
        where: { active: { equals: true } },
      }),
      // Unread contact messages
      payload.count({
        collection: 'contact-requests',
        where: { status: { equals: 'new' } },
      }),
    ])

    return NextResponse.json({
      orders: {
        active: activeOrdersResult.totalDocs || 0,
      },
      requests: {
        pending: newRequestsResult.totalDocs || 0,
      },
      buttons: {
        active: activeButtonsResult.totalDocs || 0,
        featured: featuredButtonsResult.totalDocs || 0,
      },
      categories: {
        active: activeCategoriesResult.totalDocs || 0,
      },
      contacts: {
        unread: unreadContactsResult.totalDocs || 0,
      },
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
