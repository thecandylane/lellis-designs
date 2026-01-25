import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const payload = await getPayload()

    // Sanitize the data - only allow known fields
    const allowedFields = ['name', 'slug', 'description', 'parent', 'colorPrimary', 'colorSecondary', 'icon', 'active', 'featured', 'sortOrder', 'tags', 'aliases', 'backgroundImage']
    const data: Record<string, unknown> = {}

    for (const key of allowedFields) {
      if (key in body) {
        data[key] = body[key]
      }
    }

    // Handle parent field - track if we need to clear it
    let shouldClearParent = false

    if ('parent' in data) {
      if (!data.parent || data.parent === '') {
        // Need to clear the parent - remove from data, handle after validation
        shouldClearParent = true
        delete data.parent
      } else {
        // Convert parent ID to number for postgres (Payload uses integer IDs)
        let parentId: number
        if (typeof data.parent === 'string') {
          parentId = parseInt(data.parent, 10)
        } else if (typeof data.parent === 'number') {
          parentId = data.parent
        } else {
          return NextResponse.json(
            { error: 'Invalid parent category ID format' },
            { status: 400 }
          )
        }

        if (isNaN(parentId)) {
          return NextResponse.json(
            { error: 'Invalid parent category ID format' },
            { status: 400 }
          )
        }
        data.parent = parentId

        // Prevent setting parent to self (convert id to number for comparison)
        const categoryId = parseInt(id, 10)
        if (parentId === categoryId) {
          return NextResponse.json(
            { error: 'Category cannot be its own parent' },
            { status: 400 }
          )
        }

        // Validate that parent exists and check for circular reference
        try {
          const parentCategory = await payload.findByID({
            collection: 'categories',
            id: parentId,
            depth: 0,
          })
          if (!parentCategory) {
            return NextResponse.json(
              { error: 'Parent category not found' },
              { status: 400 }
            )
          }

          // Check for circular reference - walk up the parent chain
          let currentParent = parentCategory.parent
          while (currentParent) {
            const currentParentId = typeof currentParent === 'object' ? currentParent.id : currentParent
            // Compare as numbers
            if (Number(currentParentId) === categoryId) {
              return NextResponse.json(
                { error: 'Cannot set parent: this would create a circular reference' },
                { status: 400 }
              )
            }
            // Fetch the next parent up the chain
            const nextParent = await payload.findByID({
              collection: 'categories',
              id: currentParentId,
              depth: 0,
            })
            currentParent = nextParent?.parent
          }
        } catch (err) {
          console.error('Parent validation error:', err)
          return NextResponse.json(
            { error: 'Invalid parent category ID' },
            { status: 400 }
          )
        }
      }
    }

    // If clearing parent, set it to null explicitly
    if (shouldClearParent) {
      data.parent = null
    }

    await payload.update({
      collection: 'categories',
      id,
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const payload = await getPayload()

    // The beforeDelete hook in Categories collection will handle
    // reassigning children and buttons to the parent category
    await payload.delete({
      collection: 'categories',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
