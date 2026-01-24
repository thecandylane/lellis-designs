import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

type Params = Promise<{ id: string }>

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config })

    // Sanitize parent ID - convert string to number for relationship field
    const data = { ...body }
    if (data.parent !== undefined) {
      data.parent = data.parent ? Number(data.parent) : null
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
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

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
