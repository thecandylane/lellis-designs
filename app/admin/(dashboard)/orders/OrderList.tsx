'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Sparkles, Check, X, Loader2 } from 'lucide-react'
import type { Order } from '@/lib/types'
import OrderActions from './OrderActions'

type Props = {
  orders: Order[]
}

const statusConfig: Record<Order['status'], { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending Payment', bg: 'bg-gray-100', text: 'text-gray-700' },
  paid: { label: 'Paid - Ready to Make', bg: 'bg-amber-100', text: 'text-amber-800' },
  production: { label: 'Making Buttons', bg: 'bg-blue-100', text: 'text-blue-800' },
  ready: { label: 'Ready for Pickup', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  shipped: { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-800' },
  completed: { label: 'Done', bg: 'bg-green-100', text: 'text-green-800' },
}

const statusOptions = [
  { value: 'production', label: 'In Production' },
  { value: 'ready', label: 'Ready' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
]

export default function OrderList({ orders: initialOrders }: Props) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('')
  const [loading, setLoading] = useState(false)

  // Sync local state when props change
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(orders.map(o => o.id)))
  }, [orders])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setBulkStatus('')
  }, [])

  const performBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: bulkStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update orders')
      }

      toast.success(data.message)
      clearSelection()
      router.refresh()
    } catch (error) {
      console.error('Bulk status update failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update orders')
    } finally {
      setLoading(false)
    }
  }

  const allSelected = orders.length > 0 && selectedIds.size === orders.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < orders.length

  return (
    <div className="space-y-4">
      {/* Select All / Bulk Actions Header */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={allSelected ? clearSelection : selectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                allSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : someSelected
                  ? 'bg-primary/50 border-primary text-primary-foreground'
                  : 'border-muted-foreground/30 hover:border-muted-foreground/50'
              }`}
            >
              {(allSelected || someSelected) && <Check className="w-3 h-3" />}
            </button>
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0 ? `${selectedIds.size} of ${orders.length} selected` : 'Select all'}
            </span>
          </div>

          {/* Bulk Status Update */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
              >
                <option value="">Change status to...</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={performBulkStatusUpdate}
                disabled={!bulkStatus || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </button>
              <button
                onClick={clearSelection}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isSelected={selectedIds.has(order.id)}
          onToggleSelect={() => toggleSelect(order.id)}
        />
      ))}
    </div>
  )
}

type OrderCardProps = {
  order: Order
  isSelected: boolean
  onToggleSelect: () => void
}

function OrderCard({ order, isSelected, onToggleSelect }: OrderCardProps) {
  const status = statusConfig[order.status]
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)

  const neededBy = order.needed_by_date
    ? new Date(order.needed_by_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null

  const now = new Date()
  let isUrgent = false
  if (order.needed_by_date && order.status !== 'completed') {
    const daysUntil = Math.ceil(
      (new Date(order.needed_by_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    isUrgent = daysUntil <= 3
  }

  return (
    <div className={`bg-card rounded-xl shadow-sm border overflow-hidden ${
      isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'
    }`}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Selection Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect()
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
              isSelected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            }`}
          >
            {isSelected && <Check className="w-3 h-3" />}
          </button>

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
        <div className="flex items-center gap-3 flex-wrap ml-9 sm:ml-0">
          {neededBy && (
            <div className={`${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>
              <p className="text-xs text-muted-foreground/70">Need by</p>
              <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : ''}`}>
                {neededBy} {isUrgent && '!'}
              </p>
            </div>
          )}
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-sm font-medium text-foreground/80">
            {totalQty} button{totalQty !== 1 ? 's' : ''} to make
          </span>
          <span className="text-border">-</span>
          <span className="text-sm text-muted-foreground">
            {order.shipping_method === 'pickup' ? 'Pickup' : 'Ship'}
          </span>
          <span className="text-border">-</span>
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
                    x{item.quantity}
                  </span>
                </div>

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
      {order.status !== 'completed' && (
        <div className="px-4 sm:px-5 py-4 bg-muted/50 border-t border-border/50">
          <OrderActions order={order} />
        </div>
      )}
    </div>
  )
}
