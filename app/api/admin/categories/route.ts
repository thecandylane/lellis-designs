import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, parent } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload()

    // Convert and validate parent ID if provided
    let parentId: number | null = null
    if (parent) {
      // Convert to number for Postgres
      if (typeof parent === 'string') {
        parentId = parseInt(parent, 10)
      } else if (typeof parent === 'number') {
        parentId = parent
      }

      if (parentId === null || isNaN(parentId)) {
        return NextResponse.json(
          { error: 'Invalid parent category ID format' },
          { status: 400 }
        )
      }

      try {
        const parentCategory = await payload.findByID({
          collection: 'categories',
          id: parentId,
        })
        if (!parentCategory) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid parent category ID' },
          { status: 400 }
        )
      }
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    await payload.create({
      collection: 'categories',
      data: {
        name: name.trim(),
        slug,
        parent: parentId,
        active: true,
        sortOrder: 0,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create category error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
