'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/lib/types'
import { X, MapPin, Truck, Package } from 'lucide-react'

type Props = {
  orderId: string
  currentStatus: Order['status']
  shippingMethod?: 'pickup' | 'ups' | null
}

type ExtendedStatus = Order['status'] | 'ready'

const getStatusFlow = (shippingMethod: 'pickup' | 'ups' | null): Record<Order['status'] | 'ready', { next: ExtendedStatus | null; label: string }> => ({
  pending: { next: 'paid', label: 'Mark as Paid' },
  paid: { next: 'production', label: 'Start Production' },
  production: {
    next: shippingMethod === 'pickup' ? 'ready' : 'shipped',
    label: shippingMethod === 'pickup' ? 'Ready for Pickup' : 'Mark as Shipped'
  },
  ready: { next: 'completed', label: 'Mark as Completed' },
  shipped: { next: 'completed', label: 'Mark as Completed' },
  completed: { next: null, label: '' },
})

export default function UpdateStatusButton({ orderId, currentStatus, shippingMethod }: Props) {
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ExtendedStatus | ''>('')
  const [showModal, setShowModal] = useState<'tracking' | 'pickup' | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupInstructions, setPickupInstructions] = useState('')
  const router = useRouter()

  const statusFlow = getStatusFlow(shippingMethod || null)
  const nextStatus = statusFlow[currentStatus]

  async function handleUpdateStatus(newStatus: ExtendedStatus, extraData?: Record<string, string>) {
    setLoading(true)

    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, ...extraData }),
    })

    if (res.ok) {
      router.refresh()
      setShowModal(null)
      setTrackingNumber('')
      setPickupAddress('')
      setPickupInstructions('')
    } else {
      alert('Failed to update order status')
    }

    setLoading(false)
    setSelectedStatus('')
  }

  function handleNextStatusClick() {
    if (!nextStatus.next) return

    if (nextStatus.next === 'shipped') {
      setShowModal('tracking')
    } else if (nextStatus.next === 'ready') {
      setShowModal('pickup')
    } else {
      handleUpdateStatus(nextStatus.next)
    }
  }

  function handleDropdownChange(status: ExtendedStatus) {
    setSelectedStatus(status)
    if (status === 'shipped') {
      setShowModal('tracking')
    } else if (status === 'ready') {
      setShowModal('pickup')
    }
  }

  function handleShipConfirm() {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number')
      return
    }
    handleUpdateStatus('shipped', { trackingNumber: trackingNumber.trim() })
  }

  function handlePickupConfirm() {
    handleUpdateStatus('ready', {
      pickupAddress: pickupAddress.trim() || undefined,
      pickupInstructions: pickupInstructions.trim() || undefined,
    } as Record<string, string>)
  }

  if (!nextStatus.next && currentStatus === 'completed') return null

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Quick action - move to next status */}
        {nextStatus.next && (
          <button
            onClick={handleNextStatusClick}
            disabled={loading}
            className="bg-[#461D7C] text-white px-4 py-2 rounded-md hover:bg-[#3a1866] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {nextStatus.next === 'ready' && <MapPin className="h-4 w-4" />}
            {nextStatus.next === 'shipped' && <Truck className="h-4 w-4" />}
            {loading ? 'Updating...' : nextStatus.label}
          </button>
        )}

        {/* Or select any status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">or set to:</span>
          <select
            value={selectedStatus}
            onChange={(e) => handleDropdownChange(e.target.value as ExtendedStatus)}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
          >
            <option value="">Select status...</option>
            {currentStatus !== 'pending' && <option value="pending">Pending</option>}
            {currentStatus !== 'paid' && <option value="paid">Paid</option>}
            {currentStatus !== 'production' && <option value="production">In Production</option>}
            {shippingMethod === 'pickup' && <option value="ready">Ready for Pickup</option>}
            {currentStatus !== 'shipped' && <option value="shipped">Shipped</option>}
            {currentStatus !== 'completed' && <option value="completed">Completed</option>}
          </select>
          {selectedStatus && selectedStatus !== 'shipped' && selectedStatus !== 'ready' && (
            <button
              onClick={() => handleUpdateStatus(selectedStatus as Order['status'])}
              disabled={loading}
              className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              Update
            </button>
          )}
        </div>
      </div>

      {/* Tracking Number Modal */}
      {showModal === 'tracking' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Ship Order
              </h3>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter the UPS tracking number. The customer will receive an email with tracking information.
            </p>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="1Z999AA10123456784"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleShipConfirm}
                disabled={loading || !trackingNumber.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                {loading ? 'Shipping...' : 'Ship & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Ready Modal */}
      {showModal === 'pickup' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Ready for Pickup
              </h3>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The customer will receive an email with the pickup address. You can customize the address and instructions below.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Address (optional - uses default if empty)
                </label>
                <textarea
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="123 Main St&#10;Baton Rouge, LA 70801"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (optional)
                </label>
                <input
                  type="text"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="e.g., Ring doorbell, available after 5pm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461D7C]"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePickupConfirm}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {loading ? 'Updating...' : 'Mark Ready & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
