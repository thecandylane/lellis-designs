import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

export async function GET() {
  // Check authentication
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload()

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    return NextResponse.json({
      businessName: settings.businessName || '',
      tagline: settings.tagline || '',
      pickupAddress: settings.pickupAddress || '',
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  // Check authentication
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { businessName, tagline, pickupAddress } = body

  const payload = await getPayload()

  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        ...(businessName !== undefined && { businessName }),
        ...(tagline !== undefined && { tagline }),
        ...(pickupAddress !== undefined && { pickupAddress }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
