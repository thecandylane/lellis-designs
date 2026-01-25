import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

type ButtonData = {
  name: string
  filename: string
  categoryId: string | null
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const payload = await getPayload()

    // Get button metadata from form
    const buttonsJson = formData.get('buttons') as string
    const buttons: ButtonData[] = JSON.parse(buttonsJson)

    const results: { success: boolean; name: string; error?: string }[] = []

    for (const buttonData of buttons) {
      try {
        // Get the file for this button
        const file = formData.get(`file-${buttonData.filename}`) as File
        if (!file) {
          results.push({ success: false, name: buttonData.name, error: 'File not found' })
          continue
        }

        // Convert File to Buffer for Payload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Create media entry
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: buttonData.name,
          },
          file: {
            data: buffer,
            mimetype: file.type,
            name: file.name,
            size: file.size,
          },
        })

        // Create button with the uploaded image
        // Convert category ID to number for PostgreSQL
        const categoryId = buttonData.categoryId ? Number(buttonData.categoryId) : undefined

        await payload.create({
          collection: 'buttons',
          data: {
            name: buttonData.name,
            image: media.id,
            category: categoryId,
            price: 5,
            active: true,
          },
        })

        results.push({ success: true, name: buttonData.name })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results.push({ success: false, name: buttonData.name, error: errorMessage })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: `Created ${successCount} buttons${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results,
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Bulk upload failed', details: errorMessage },
      { status: 500 }
    )
  }
}
