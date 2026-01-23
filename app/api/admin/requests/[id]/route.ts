import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

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

    // Handle nested field updates (e.g., 'adminSection.quotedPrice')
    const updateData: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(body)) {
      if (key.includes('.')) {
        // Parse nested paths like 'adminSection.quotedPrice'
        const parts = key.split('.')
        let current = updateData

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {}
          }
          current = current[parts[i]] as Record<string, unknown>
        }

        current[parts[parts.length - 1]] = value
      } else {
        updateData[key] = value
      }
    }

    await payload.update({
      collection: 'custom-requests',
      id,
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const payload = await getPayload()

    await payload.delete({
      collection: 'custom-requests',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete request error:', error)
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    )
  }
}
