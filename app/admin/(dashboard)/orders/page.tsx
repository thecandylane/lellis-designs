import { getPayload } from '@/lib/payload'
import type { Order } from '@/lib/types'
import type { Where } from 'payload'
import Link from 'next/link'
import SearchBar from '@/components/admin/SearchBar'
import OrderList from './OrderList'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ status?: string; q?: string }>

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

const filterTabs = [
  { key: 'active', label: 'Active Orders', description: 'Needs attention' },
  { key: 'all', label: 'All Orders', description: 'Everything' },
  { key: 'completed', label: 'Completed', description: 'Finished orders' },
]

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const filter = params.status || 'active'
  const searchQuery = params.q || ''
  const payload = await getPayload()

  // Build where clause based on filter
  const conditions: Where[] = []

  if (filter === 'active') {
    conditions.push({ status: { in: ['paid', 'production', 'ready', 'shipped'] } })
  } else if (filter === 'completed') {
    conditions.push({ status: { equals: 'completed' } })
  }

  // Add search conditions
  if (searchQuery) {
    conditions.push({
      or: [
        { customerName: { contains: searchQuery } },
        { customerEmail: { contains: searchQuery } },
        { id: { contains: searchQuery } },
      ],
    })
  }

  const whereClause: Where | undefined = conditions.length > 0
    ? conditions.length === 1
      ? conditions[0]
      : { and: conditions }
    : undefined

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">View and fulfill customer orders</p>
        </div>
        <div className="w-full sm:w-64">
          <SearchBar placeholder="Search orders..." />
        </div>
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
        <OrderList orders={orders} />
      )}
    </div>
  )
}
