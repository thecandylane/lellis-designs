import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface MediaObject {
  url?: string
  filename?: string
}

interface ButtonDoc {
  id: string
  name: string
  image?: MediaObject | string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    const payload = await getPayload({ config })

    // Fetch active buttons with their images
    const result = await payload.find({
      collection: 'buttons',
      where: {
        active: { equals: true },
      },
      limit: 100, // Fetch more than needed so we can randomize
      depth: 1, // Populate the image relationship
    })

    // Shuffle and take the requested amount
    const shuffled = result.docs
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

    // Extract image URLs
    const buttons = shuffled.map((doc) => {
      const button = doc as unknown as ButtonDoc
      let imageUrl = ''
      if (button.image && typeof button.image === 'object' && button.image.url) {
        imageUrl = button.image.url
      }
      return {
        id: button.id,
        name: button.name,
        image_url: imageUrl,
      }
    }).filter(b => b.image_url) // Only include buttons with valid images

    return NextResponse.json({ buttons })
  } catch (error) {
    console.error('Fetch random buttons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buttons', buttons: [] },
      { status: 500 }
    )
  }
}
