import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'
import { validatePositiveNumber, validateStringLength } from '@/lib/security'

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

    try {
      // Validate numeric fields
      if (body.shipping_cost !== undefined) {
        body.shipping_cost = validatePositiveNumber(body.shipping_cost, 'shipping_cost')
      }
      if (body.subtotal !== undefined) {
        body.subtotal = validatePositiveNumber(body.subtotal, 'subtotal')
      }
      if (body.total !== undefined) {
        body.total = validatePositiveNumber(body.total, 'total')
      }

      // Validate string lengths
      if (body.customer_name !== undefined) {
        body.customer_name = validateStringLength(body.customer_name, 'customer_name', 200)
      }
      if (body.customer_email !== undefined) {
        body.customer_email = validateStringLength(body.customer_email, 'customer_email', 254)
      }
      if (body.customer_phone !== undefined) {
        body.customer_phone = validateStringLength(body.customer_phone, 'customer_phone', 30)
      }
      if (body.notes !== undefined) {
        body.notes = validateStringLength(body.notes, 'notes', 2000)
      }

      // Validate enums
      const VALID_STATUSES = ['pending', 'paid', 'production', 'ready', 'shipped', 'completed']
      if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
        throw new Error(`Invalid status. Must be: ${VALID_STATUSES.join(', ')}`)
      }

      const VALID_SHIPPING = ['pickup', 'ups']
      if (body.shipping_method !== undefined && !VALID_SHIPPING.includes(body.shipping_method)) {
        throw new Error(`Invalid shipping method. Must be: ${VALID_SHIPPING.join(', ')}`)
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Validation failed' },
        { status: 400 }
      )
    }

    // Map snake_case to camelCase for Payload
    const updateData: Record<string, unknown> = {}

    if (body.customer_name !== undefined) updateData.customerName = body.customer_name
    if (body.customer_email !== undefined) updateData.customerEmail = body.customer_email
    if (body.customer_phone !== undefined) updateData.customerPhone = body.customer_phone
    if (body.shipping_method !== undefined) updateData.shippingMethod = body.shipping_method
    if (body.shipping_address !== undefined) updateData.shippingAddress = body.shipping_address
    if (body.shipping_cost !== undefined) updateData.shippingCost = body.shipping_cost
    if (body.needed_by_date !== undefined) updateData.neededByDate = body.needed_by_date
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal
    if (body.total !== undefined) updateData.total = body.total
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.status !== undefined) updateData.status = body.status
    if (body.items !== undefined) updateData.items = body.items

    await payload.update({
      collection: 'orders',
      id,
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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
      collection: 'orders',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
