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

    await payload.update({
      collection: 'contact-requests',
      id,
      data: {
        status: body.status,
      },
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
