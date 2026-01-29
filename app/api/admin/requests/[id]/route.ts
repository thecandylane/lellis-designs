import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { sendQuoteNotification } from '@/lib/email'
import { validatePositiveNumber } from '@/lib/security'

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

    // Whitelist of allowed fields
    const ALLOWED_TOP_LEVEL = [
      'status', 'customerName', 'customerEmail',
      'customerPhone', 'preferredContact', 'isRush'
    ] as const

    const ALLOWED_NESTED = {
      adminSection: ['quotedPrice', 'rushFee', 'adminNotes', 'internalStatus'],
      designDetails: ['description', 'eventType', 'colorPreferences'],
      textOptions: ['wantsText', 'textContent', 'fontPreference'],
      orderDetails: ['quantity', 'neededByDate', 'isFlexibleDate', 'deliveryPreference'],
    } as const

    const updateData: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(body)) {
      if (key.includes('.')) {
        const parts = key.split('.')
        if (parts.length !== 2) continue // Only 1 level deep

        const [parent, child] = parts
        const allowedChildren = ALLOWED_NESTED[parent as keyof typeof ALLOWED_NESTED]
        if (!allowedChildren?.includes(child as any)) continue

        // Validate numeric fields
        if (parent === 'adminSection' && (child === 'quotedPrice' || child === 'rushFee')) {
          try {
            const validated = validatePositiveNumber(value, `${parent}.${child}`)
            if (!updateData[parent]) updateData[parent] = {}
            ;(updateData[parent] as Record<string, unknown>)[child] = validated
          } catch (error) {
            return NextResponse.json(
              { error: error instanceof Error ? error.message : 'Validation failed' },
              { status: 400 }
            )
          }
          continue
        }

        if (parent === 'orderDetails' && child === 'quantity') {
          try {
            const validated = validatePositiveNumber(value, 'quantity', { min: 1 })
            if (!updateData[parent]) updateData[parent] = {}
            ;(updateData[parent] as Record<string, unknown>)[child] = validated
          } catch (error) {
            return NextResponse.json(
              { error: error instanceof Error ? error.message : 'Validation failed' },
              { status: 400 }
            )
          }
          continue
        }

        // Valid nested field
        if (!updateData[parent]) updateData[parent] = {}
        ;(updateData[parent] as Record<string, unknown>)[child] = value
      } else {
        // Top-level field
        if (ALLOWED_TOP_LEVEL.includes(key as any)) {
          updateData[key] = value
        }
      }
    }

    await payload.update({
      collection: 'custom-requests',
      id,
      data: updateData,
    })

    // If status is being set to "quoted", send quote notification email
    if (updateData.status === 'quoted') {
      try {
        const customRequest = await payload.findByID({
          collection: 'custom-requests',
          id,
        })

        if (customRequest) {
          await sendQuoteNotification({
            requestId: id,
            customerEmail: customRequest.customerEmail as string,
            customerName: customRequest.customerName as string,
            quotedPrice: (customRequest.adminSection as { quotedPrice?: number })?.quotedPrice || 0,
            rushFee: (customRequest.adminSection as { rushFee?: number })?.rushFee,
            quantity: (customRequest.orderDetails as { quantity?: number })?.quantity || 1,
            description: (customRequest.designDetails as { description?: string })?.description || '',
            neededByDate: (customRequest.orderDetails as { neededByDate?: string })?.neededByDate,
          })
        }
      } catch (emailError) {
        console.error('Failed to send quote notification email:', emailError)
        // Don't fail the request, the update was successful
      }
    }

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
