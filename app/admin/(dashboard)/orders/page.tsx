import { getPayload } from '@/lib/payload'
import type { Order } from '@/lib/types'
import type { Where } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import OrderActions from './OrderActions'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ status?: string }>

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

const statusConfig: Record<Order['status'], { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending Payment', bg: 'bg-gray-100', text: 'text-gray-700' },
  paid: { label: 'Paid - Ready to Make', bg: 'bg-amber-100', text: 'text-amber-800' },
  production: { label: 'Making Buttons', bg: 'bg-blue-100', text: 'text-blue-800' },
  ready: { label: 'Ready for Pickup', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  shipped: { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-800' },
  completed: { label: 'Done', bg: 'bg-green-100', text: 'text-green-800' },
}

const filterTabs = [
  { key: 'active', label: 'Active Orders', description: 'Needs attention' },
  { key: 'all', label: 'All Orders', description: 'Everything' },
  { key: 'completed', label: 'Completed', description: 'Finished orders' },
]

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const filter = params.status || 'active'
  const payload = await getPayload()

  // Build where clause based on filter
  let whereClause: Where | undefined
  if (filter === 'active') {
    whereClause = {
      status: { in: ['paid', 'production', 'ready', 'shipped'] }
    }
  } else if (filter === 'completed') {
    whereClause = { status: { equals: 'completed' } }
  }

  const { docs } = await payload.find({
    collection: 'orders',
    where: whereClause,
    sort: '-createdAt',
    limit: 100,
  })

  const orders = docs.map((doc) => toOrder(doc as PayloadOrder))

  // Count active orders for badge
  const { totalDocs: activeCount } = await payload.count({
    collection: 'orders',
    where: { status: { in: ['paid', 'production', 'ready', 'shipped'] } },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">View and fulfill customer orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {filterTabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'all' ? '/admin/orders?status=all' : `/admin/orders?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            {tab.label}
            {tab.key === 'active' && activeCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'active' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {activeCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No orders found</h3>
          <p className="text-muted-foreground">
            {filter === 'active' ? 'No active orders right now!' : 'Orders will appear here when customers place them.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.status]
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)

  const neededBy = order.needed_by_date
    ? new Date(order.needed_by_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null

  // Check urgency - compute outside render for purity
  const now = new Date()
  let isUrgent = false
  if (order.needed_by_date && order.status !== 'completed') {
    const daysUntil = Math.ceil(
      (new Date(order.needed_by_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    isUrgent = daysUntil <= 3
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">
                {order.customer_name || order.customer_email.split('@')[0]}
              </p>
              {order.order_type === 'custom' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <Sparkles className="w-3 h-3" />
                  Custom
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground break-all">{order.customer_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {neededBy && (
            <div className={`${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>
              <p className="text-xs text-muted-foreground/70">Need by</p>
              <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : ''}`}>
                {neededBy} {isUrgent && '⚠️'}
              </p>
            </div>
          )}
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Items - The Main Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-sm font-medium text-foreground/80">
            {totalQty} button{totalQty !== 1 ? 's' : ''} to make
          </span>
          <span className="text-border">•</span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_method === 'pickup' ? '📍 Pickup' : '📦 Ship'}
          </span>
          <span className="text-border">•</span>
          <span className="text-sm font-medium text-foreground">
            ${order.total.toFixed(2)}
          </span>
        </div>

        <div className="grid gap-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-3 bg-muted rounded-lg">
              {/* Button Image */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-card border border-border">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-foreground">{item.name}</h4>
                  <span className="ml-2 px-2 py-1 bg-card rounded text-sm font-bold text-foreground/80 border border-border">
                    ×{item.quantity}
                  </span>
                </div>

                {/* Customization Details */}
                {(item.personName || item.personNumber || item.notes) && (
                  <div className="mt-2 space-y-1">
                    {item.personName && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Name:</span>{' '}
                        <span className="font-medium text-foreground">{item.personName}</span>
                      </p>
                    )}
                    {item.personNumber && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Number/Class:</span>{' '}
                        <span className="font-medium text-foreground">{item.personNumber}</span>
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Notes:</span>{' '}
                        <span className="text-foreground/80">{item.notes}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Request Link */}
        {order.order_type === 'custom' && order.custom_request_id && (
          <div className="mt-3 pt-3 border-t border-border">
            <Link
              href="/admin/requests"
              className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800"
            >
              <Sparkles className="w-4 h-4" />
              View original custom request
            </Link>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      {order.status !== 'completed' && order.status !== 'pending' && (
        <div className="px-4 sm:px-5 py-4 bg-muted/50 border-t border-border/50">
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            shippingMethod={order.shipping_method}
          />
        </div>
      )}
    </div>
  )
}
