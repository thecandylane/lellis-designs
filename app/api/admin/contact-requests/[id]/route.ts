import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import {
  CONTACT_REQUEST_ALLOWED_STATUS,
  CONTACT_REQUEST_ALLOWED_FIELDS,
  validateStatus,
  filterToAllowedFields,
} from '@/lib/validation/field-whitelists'

type Params = Promise<{ id: string }>

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const payload = await getPayload()

    // Filter to only allowed fields
    const updateData = filterToAllowedFields(body, CONTACT_REQUEST_ALLOWED_FIELDS)

    // Validate status if it's being updated
    if ('status' in updateData) {
      try {
        updateData.status = validateStatus(
          updateData.status,
          CONTACT_REQUEST_ALLOWED_STATUS
        )
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Invalid status' },
          { status: 400 }
        )
      }
    }

    await payload.update({
      collection: 'contact-requests',
      id,
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update contact request error:', error)
    return NextResponse.json(
      { error: 'Failed to update contact request' },
      { status: 500 }
    )
  }
}
