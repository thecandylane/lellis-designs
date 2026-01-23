import { getPayload } from '@/lib/payload'
import StatCard from '@/components/admin/StatCard'
import OrderCard from '@/components/admin/OrderCard'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Type for Payload order document
type PayloadOrder = {
  id: string
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

async function getStats() {
  const payload = await getPayload()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    paidOrdersResult,
    weekOrdersResult,
    allOrdersResult,
    newRequestsResult,
  ] = await Promise.all([
    // "paid" orders are ones that need to be fulfilled
    payload.count({
      collection: 'orders',
      where: { status: { equals: 'paid' } },
    }),
    payload.find({
      collection: 'orders',
      where: { createdAt: { greater_than_equal: weekAgo.toISOString() } },
      limit: 1000,
    }),
    payload.find({
      collection: 'orders',
      limit: 10000,
    }),
    payload.count({
      collection: 'custom-requests',
      where: { status: { equals: 'new' } },
    }),
  ])

  const weekRevenue = weekOrdersResult.docs.reduce((sum, o) => sum + ((o as PayloadOrder).total || 0), 0)
  const totalRevenue = allOrdersResult.docs.reduce((sum, o) => sum + ((o as PayloadOrder).total || 0), 0)

  return {
    newOrders: paidOrdersResult.totalDocs || 0,
    weekOrders: weekOrdersResult.docs.length,
    weekRevenue,
    totalRevenue,
    newRequests: newRequestsResult.totalDocs || 0,
  }
}

async function getRecentOrders(): Promise<Order[]> {
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'orders',
    sort: '-createdAt',
    limit: 5,
  })

  return docs.map((doc) => toOrder(doc as PayloadOrder))
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(),
  ])

  const formatCurrency = (dollars: number) =>
    dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orders to Fulfill"
          value={stats.newOrders}
          sublabel="Paid, awaiting production"
        />
        <StatCard
          label="Orders This Week"
          value={stats.weekOrders}
          sublabel={formatCurrency(stats.weekRevenue)}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          sublabel="All time"
        />
        <StatCard
          label="Custom Requests"
          value={stats.newRequests}
          sublabel="New inquiries"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-4">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
