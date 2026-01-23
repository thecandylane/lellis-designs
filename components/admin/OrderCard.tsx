import Link from 'next/link'
import type { Order } from '@/lib/types'

type OrderCardProps = {
  order: Order
}

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-yellow-100 text-yellow-800',
  production: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
}

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pending',
  paid: 'Paid',
  production: 'In Production',
  ready: 'Ready for Pickup',
  shipped: 'Shipped',
  completed: 'Completed',
}

export default function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatCurrency = (dollars: number) =>
    dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Link
      href={`/admin/orders?id=${order.id}`}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-gray-900 truncate">
            {order.customer_name || order.customer_email}
          </p>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(order.created_at)} &middot; {itemCount} item{itemCount !== 1 ? 's' : ''}
          {order.shipping_method && (
            <> &middot; {order.shipping_method === 'pickup' ? 'Local Pickup' : 'UPS Shipping'}</>
          )}
        </p>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
      </div>
    </Link>
  )
}
