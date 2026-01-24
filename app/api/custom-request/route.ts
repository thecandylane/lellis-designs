import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendAdminCustomRequestNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const payload = await getPayload({ config })

    // Extract form fields
    const customerName = formData.get('customerName') as string
    const customerEmail = formData.get('customerEmail') as string
    const customerPhone = formData.get('customerPhone') as string
    const preferredContact = formData.get('preferredContact') as string
    const description = formData.get('description') as string
    const eventType = formData.get('eventType') as string
    const colorPreferences = formData.get('colorPreferences') as string
    const wantsText = formData.get('wantsText') as string
    const textContent = formData.get('textContent') as string
    const fontPreference = formData.get('fontPreference') as string
    const quantity = parseInt(formData.get('quantity') as string) || 1
    const neededByDate = formData.get('neededByDate') as string
    const isFlexibleDate = formData.get('isFlexibleDate') as string
    const deliveryPreference = formData.get('deliveryPreference') as string
    const additionalInfo = formData.get('additionalInfo') as string
    const isRush = formData.get('isRush') === 'true'

    // Validate required fields
    if (!customerName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!customerEmail?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Please describe what you\'re looking for' }, { status: 400 })
    }
    if (!neededByDate) {
      return NextResponse.json({ error: 'Please let us know when you need the buttons' }, { status: 400 })
    }

    // Handle file uploads
    const referenceImages: { image: number | string; description: string }[] = []
    const imageFiles = formData.getAll('images') as File[]
    const imageDescriptions = formData.getAll('imageDescriptions') as string[]

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      if (file && file.size > 0) {
        try {
          // Convert File to Buffer for Payload
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Upload to Payload media
          const uploadedMedia = await payload.create({
            collection: 'media',
            data: {
              alt: `Custom request reference from ${customerName}`,
            },
            file: {
              data: buffer,
              mimetype: file.type,
              name: file.name,
              size: file.size,
            },
          })

          referenceImages.push({
            image: uploadedMedia.id,
            description: imageDescriptions[i] || '',
          })
        } catch (uploadError) {
          // Check for filesystem error (missing Blob storage on Vercel)
          if (uploadError instanceof Error && uploadError.message.includes('ENOENT')) {
            console.error(`Image upload failed - BLOB_READ_WRITE_TOKEN may not be configured:`, uploadError.message)
          } else {
            console.error(`Failed to upload image ${i + 1}:`, uploadError)
          }
          // Continue with other images instead of failing completely
        }
      }
    }

    // Create the custom request
    const customRequest = await payload.create({
      collection: 'custom-requests',
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        preferredContact: preferredContact || 'email',
        status: 'new',
        isRush,
        designDetails: {
          description: description.trim(),
          eventType: eventType?.trim() || undefined,
          colorPreferences: colorPreferences?.trim() || undefined,
        },
        textOptions: {
          wantsText: wantsText || 'no',
          textContent: textContent?.trim() || undefined,
          fontPreference: fontPreference || undefined,
        },
        referenceImages,
        orderDetails: {
          quantity,
          neededByDate,
          isFlexibleDate: isFlexibleDate || 'somewhat',
          deliveryPreference: deliveryPreference || 'either',
        },
        additionalInfo: additionalInfo?.trim() || undefined,
      },
    })

    // Send notification email to admin
    try {
      await sendAdminCustomRequestNotification({
        requestId: String(customRequest.id),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        description: description.trim(),
        quantity,
        neededByDate,
        isRush,
        eventType: eventType?.trim(),
      })
    } catch (emailError) {
      // Log but don't fail the request submission
      console.error('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted! We\'ll be in touch soon.',
      id: customRequest.id,
    })
  } catch (error) {
    console.error('Custom request submission error:', error)
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}
