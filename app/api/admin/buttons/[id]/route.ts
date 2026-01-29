import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { BUTTON_ALLOWED_FIELDS, filterToAllowedFields } from '@/lib/validation/field-whitelists'

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

    // Filter to only allowed fields to prevent field injection
    const updateData = filterToAllowedFields(body, BUTTON_ALLOWED_FIELDS)

    await payload.update({
      collection: 'buttons',
      id,
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update button error:', error)
    return NextResponse.json(
      { error: 'Failed to update button' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const payload = await getPayload()

    await payload.delete({
      collection: 'buttons',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete button error:', error)
    return NextResponse.json(
      { error: 'Failed to delete button' },
      { status: 500 }
    )
  }
}
