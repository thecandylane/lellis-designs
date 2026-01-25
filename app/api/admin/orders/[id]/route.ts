import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

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
