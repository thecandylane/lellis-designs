import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const payload = await getPayload()

    // Convert File to Buffer for Payload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create the media document
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt text
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    })

    return NextResponse.json({
      id: media.id,
      url: media.url,
      filename: media.filename,
    })
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}
