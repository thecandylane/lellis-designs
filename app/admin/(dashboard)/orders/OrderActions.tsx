'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Truck, Package, Loader2, Edit2, Trash2, X, Save } from 'lucide-react'
import type { Order } from '@/lib/types'

type OrderActionsProps = {
  order: Order
}

export default function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showTrackingInput, setShowTrackingInput] = useState(false)
  const [showPickupInput, setShowPickupInput] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [pickupAddress, setPickupAddress] = useState(process.env.NEXT_PUBLIC_PICKUP_ADDRESS || '')
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    customer_name: order.customer_name || '',
    customer_email: order.customer_email,
    customer_phone: order.customer_phone || '',
    notes: order.notes || '',
    shipping_method: order.shipping_method || 'pickup',
  })

  const updateStatus = async (newStatus: string, extra?: Record<string, string>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extra }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleStartProduction = () => updateStatus('production')

  const handleMarkReady = () => {
    if (order.shipping_method === 'pickup') {
      setShowPickupInput(true)
    } else {
      updateStatus('ready')
    }
  }

  const handleConfirmPickup = () => {
    if (!pickupAddress.trim()) {
      setError('Please enter a pickup address')
      return
    }
    updateStatus('ready', { pickupAddress })
    setShowPickupInput(false)
  }

  const handleMarkShipped = () => {
    if (order.shipping_method === 'ups') {
      setShowTrackingInput(true)
    } else {
      updateStatus('shipped')
    }
  }

  const handleConfirmShipped = () => {
    updateStatus('shipped', { trackingNumber })
    setShowTrackingInput(false)
  }

  const handleComplete = () => updateStatus('completed')

  async function handleDelete() {
    setLoading(true)

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete order')
      setLoading(false)
    }
  }

  async function handleSaveEdit() {
    setLoading(true)

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })

    if (res.ok) {
      setShowEditModal(false)
      router.refresh()
    } else {
      alert('Failed to update order')
    }

    setLoading(false)
  }

  // Determine which button to show based on current status
  const getNextAction = () => {
    switch (order.status) {
      case 'paid':
        return {
          label: 'Start Making',
          icon: Package,
          action: handleStartProduction,
          color: 'bg-blue-600 hover:bg-blue-700',
        }
      case 'production':
        if (order.shipping_method === 'pickup') {
          return {
            label: 'Ready for Pickup',
            icon: CheckCircle,
            action: handleMarkReady,
            color: 'bg-emerald-600 hover:bg-emerald-700',
          }
        }
        return {
          label: 'Mark as Shipped',
          icon: Truck,
          action: handleMarkShipped,
          color: 'bg-purple-600 hover:bg-purple-700',
        }
      case 'ready':
      case 'shipped':
        return {
          label: 'Mark Complete',
          icon: CheckCircle,
          action: handleComplete,
          color: 'bg-green-600 hover:bg-green-700',
        }
      default:
        return null
    }
  }

  const nextAction = getNextAction()

  // Show pickup address input
  if (showPickupInput) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Address
          </label>
          <textarea
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder="Enter the pickup address..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be sent to the customer
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleConfirmPickup}
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Send Pickup Details
          </button>
          <button
            onClick={() => setShowPickupInput(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Show tracking number input
  if (showTrackingInput) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UPS Tracking Number (optional)
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="1Z999AA10123456784"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleConfirmShipped}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Confirm Shipped
          </button>
          <button
            onClick={() => setShowTrackingInput(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Default view with status action + edit/delete
  return (
    <>
      <div className="flex items-center justify-between">
        {/* Status action button */}
        <div>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          {nextAction && (
            <button
              onClick={nextAction.action}
              disabled={loading}
              className={`${nextAction.color} text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <nextAction.icon className="w-4 h-4" />
              )}
              {nextAction.label}
            </button>
          )}
        </div>

        {/* Edit/Delete buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Edit Order
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editData.customer_name}
                  onChange={(e) => setEditData({ ...editData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={editData.customer_email}
                  onChange={(e) => setEditData({ ...editData, customer_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  value={editData.customer_phone}
                  onChange={(e) => setEditData({ ...editData, customer_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Method
                </label>
                <select
                  value={editData.shipping_method}
                  onChange={(e) => setEditData({ ...editData, shipping_method: e.target.value as 'pickup' | 'ups' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                >
                  <option value="pickup">Local Pickup</option>
                  <option value="ups">UPS Shipping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="bg-[#461D7C] text-white px-4 py-2 rounded-md hover:bg-[#3a1866] disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Order
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <p className="text-sm">
                <strong>Customer:</strong> {order.customer_name || order.customer_email}
              </p>
              <p className="text-sm">
                <strong>Total:</strong> ${order.total.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
