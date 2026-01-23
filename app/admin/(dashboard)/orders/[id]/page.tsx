import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import type { Order } from '@/lib/types'
import Link from 'next/link'
import UpdateStatusButton from './UpdateStatusButton'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

// Type for Payload order document
type PayloadOrder = {
  id: string
  orderType?: 'standard' | 'custom' | null
  customRequestId?: string | { id: string } | null
  stripeSessionId?: string | null
  customerEmail: string
  customerName?: string | null
  customerPhone?: string | null
  shippingMethod?: 'pickup' | 'ups' | null
  shippingAddress?: Record<string, unknown> | null
  shippingCost?: number | null
  neededByDate?: string | null
  productionDeadline?: string | null
  subtotal: number
  total: number
  items: unknown[]
  status: 'pending' | 'paid' | 'production' | 'ready' | 'shipped' | 'completed'
  notes?: string | null
  ambassadorCode?: string | null
  createdAt: string
}

// Convert Payload order to our Order type
function toOrder(doc: PayloadOrder): Order {
  return {
    id: doc.id,
    order_type: doc.orderType || 'standard',
    custom_request_id: typeof doc.customRequestId === 'object'
      ? doc.customRequestId?.id || null
      : doc.customRequestId || null,
    stripe_session_id: doc.stripeSessionId || null,
    customer_email: doc.customerEmail,
    customer_name: doc.customerName || null,
    customer_phone: doc.customerPhone || null,
    shipping_method: doc.shippingMethod || null,
    shipping_address: doc.shippingAddress || null,
    shipping_cost: doc.shippingCost || 0,
    needed_by_date: doc.neededByDate || null,
    production_deadline: doc.productionDeadline || null,
    subtotal: doc.subtotal,
    total: doc.total,
    items: doc.items as Order['items'],
    status: doc.status,
    notes: doc.notes || null,
    ambassador_code: doc.ambassadorCode || null,
    created_at: doc.createdAt,
  }
}

const statusConfig: Record<Order['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-800' },
  paid: { label: 'Paid', className: 'bg-yellow-100 text-yellow-800' },
  production: { label: 'In Production', className: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready for Pickup', className: 'bg-emerald-100 text-emerald-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params
  const payload = await getPayload()

  let order: PayloadOrder | null = null
  try {
    order = await payload.findByID({
      collection: 'orders',
      id,
    }) as PayloadOrder
  } catch {
    notFound()
  }

  if (!order) {
    notFound()
  }

  const typedOrder = toOrder(order)
  const status = statusConfig[typedOrder.status]

  const formattedDate = new Date(typedOrder.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const formattedNeededBy = typedOrder.needed_by_date
    ? new Date(typedOrder.needed_by_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const formattedTotal = typedOrder.total.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  // Check if needed_by_date is within a week
  let isUrgent = false
  if (typedOrder.needed_by_date) {
    const neededByTime = new Date(typedOrder.needed_by_date).getTime()
    const now = new Date()
    const oneWeekFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
    isUrgent = neededByTime <= oneWeekFromNow.getTime()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="mt-1 text-gray-900">{typedOrder.customer_name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{typedOrder.customer_email}</p>
              {typedOrder.customer_phone && (
                <p className="text-sm text-gray-600">{typedOrder.customer_phone}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="mt-1 text-gray-900 font-semibold">{formattedTotal}</p>
              {typedOrder.shipping_cost > 0 && (
                <p className="text-sm text-gray-500">
                  (includes ${typedOrder.shipping_cost} shipping)
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Shipping</h3>
              <p className="mt-1 text-gray-900">
                {typedOrder.shipping_method === 'pickup' ? 'Local Pickup' :
                 typedOrder.shipping_method === 'ups' ? 'UPS Shipping' : 'Not specified'}
              </p>
            </div>
            {formattedNeededBy && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Needed By</h3>
                <p className={`mt-1 ${isUrgent && typedOrder.status !== 'completed' ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {formattedNeededBy}
                  {isUrgent && typedOrder.status !== 'completed' && ' (Soon!)'}
                </p>
              </div>
            )}
            {typedOrder.ambassador_code && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Referral</h3>
                <p className="mt-1 text-gray-900">{typedOrder.ambassador_code}</p>
              </div>
            )}
            {typedOrder.notes && (
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-gray-900">{typedOrder.notes}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Items</h3>
            <div className="space-y-4">
              {typedOrder.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                      {(item.personName || item.personNumber || item.notes) && (
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                          {item.personName && (
                            <p><span className="font-medium">Name:</span> {item.personName}</p>
                          )}
                          {item.personNumber && (
                            <p><span className="font-medium">Number/Class:</span> {item.personNumber}</p>
                          )}
                          {item.notes && (
                            <p><span className="font-medium">Notes:</span> {item.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {typedOrder.status !== 'completed' && (
            <div className="pt-4 border-t border-gray-200">
              <UpdateStatusButton
                orderId={typedOrder.id}
                currentStatus={typedOrder.status}
                shippingMethod={typedOrder.shipping_method}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
