import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, parent } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Validate parent exists if provided
    if (parent) {
      try {
        const parentCategory = await payload.findByID({
          collection: 'categories',
          id: parent,
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
        parent: parent || null,
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
