'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Truck, Package, Loader2 } from 'lucide-react'

type OrderActionsProps = {
  orderId: string
  currentStatus: string
  shippingMethod: 'pickup' | 'ups' | null
}

export default function OrderActions({
  orderId,
  currentStatus,
  shippingMethod,
}: OrderActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showTrackingInput, setShowTrackingInput] = useState(false)
  const [showPickupInput, setShowPickupInput] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [pickupAddress, setPickupAddress] = useState(process.env.NEXT_PUBLIC_PICKUP_ADDRESS || '')
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (newStatus: string, extra?: Record<string, string>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
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
    if (shippingMethod === 'pickup') {
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
    if (shippingMethod === 'ups') {
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

  // Determine which button to show based on current status
  const getNextAction = () => {
    switch (currentStatus) {
      case 'paid':
        return {
          label: 'Start Making',
          icon: Package,
          action: handleStartProduction,
          color: 'bg-blue-600 hover:bg-blue-700',
        }
      case 'production':
        if (shippingMethod === 'pickup') {
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

  if (!nextAction) return null

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

  // Default button
  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
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
    </div>
  )
}
