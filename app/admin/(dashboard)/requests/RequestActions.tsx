'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Phone,
  Mail,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  ShoppingBag,
  CreditCard,
  Banknote,
  ExternalLink,
} from 'lucide-react'

type RequestActionsProps = {
  requestId: string
  currentStatus: string
  customerEmail: string
  customerPhone: string
  quotedPrice?: number
  convertedOrderId?: string
  deliveryPreference?: string
}

const STATUS_FLOW: Record<string, { next: string; label: string; icon: typeof CheckCircle }[]> = {
  new: [
    { next: 'contacted', label: 'Mark as Contacted', icon: Phone },
    { next: 'declined', label: 'Decline Request', icon: XCircle },
  ],
  contacted: [
    { next: 'quoted', label: 'Send Quote', icon: DollarSign },
    { next: 'declined', label: 'Decline Request', icon: XCircle },
  ],
  quoted: [
    { next: 'approved', label: 'Customer Approved', icon: CheckCircle },
    { next: 'declined', label: 'Customer Declined', icon: XCircle },
  ],
  approved: [
    { next: 'production', label: 'Start Production', icon: CheckCircle },
  ],
  production: [
    { next: 'completed', label: 'Mark Completed', icon: CheckCircle },
  ],
}

export default function RequestActions({
  requestId,
  currentStatus,
  customerEmail,
  customerPhone,
  quotedPrice,
  convertedOrderId,
  deliveryPreference,
}: RequestActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [quoteAmount, setQuoteAmount] = useState(quotedPrice?.toString() || '')
  const [notes, setNotes] = useState('')
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'stripe' | 'cash' | 'venmo' | 'other'>('stripe')
  const [orderShippingMethod, setOrderShippingMethod] = useState<'pickup' | 'ups'>(
    deliveryPreference === 'ship' ? 'ups' : 'pickup'
  )

  const actions = STATUS_FLOW[currentStatus] || []

  const handleStatusUpdate = async (newStatus: string, additionalData?: Record<string, unknown>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update request')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Failed to update request. Please try again.')
    } finally {
      setLoading(false)
      setShowQuoteForm(false)
    }
  }

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quoteAmount) return

    handleStatusUpdate('quoted', {
      'adminSection.quotedPrice': parseFloat(quoteAmount),
      'adminSection.notes': notes || undefined,
    })
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/custom-requests/${requestId}/convert-to-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: orderPaymentMethod,
          shippingMethod: orderShippingMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // If Stripe, open payment link in new tab
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank')
        alert(`Order created! Payment link opened in new tab.\n\nYou can also send this link to the customer:\n${data.paymentUrl}`)
      } else {
        alert('Order created successfully!')
      }

      router.refresh()
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
    } finally {
      setLoading(false)
      setShowOrderForm(false)
    }
  }

  if (currentStatus === 'completed' || currentStatus === 'declined') {
    return (
      <div className="text-sm text-gray-500">
        This request has been {currentStatus}.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick contact buttons */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Contact:</span>
        <a
          href={`mailto:${customerEmail}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email
        </a>
        <a
          href={`tel:${customerPhone}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <a
          href={`sms:${customerPhone}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Text
        </a>
      </div>

      {/* Quote form */}
      {showQuoteForm && (
        <form onSubmit={handleQuoteSubmit} className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this quote..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !quoteAmount}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Save Quote
            </button>
            <button
              type="button"
              onClick={() => setShowQuoteForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Create Order form */}
      {showOrderForm && (
        <form onSubmit={handleCreateOrder} className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-teal-800 font-medium">
            <ShoppingBag className="w-5 h-5" />
            Create Order from Custom Request
          </div>

          {quotedPrice && (
            <div className="text-sm text-gray-600 bg-white rounded p-2">
              <span className="font-medium">Total:</span> ${quotedPrice.toFixed(2)}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderPaymentMethod('stripe')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  orderPaymentMethod === 'stripe'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Stripe</div>
                  <div className="text-xs text-gray-500">Send payment link</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setOrderPaymentMethod('cash')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  orderPaymentMethod === 'cash'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Cash</div>
                  <div className="text-xs text-gray-500">Already paid</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setOrderPaymentMethod('venmo')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  orderPaymentMethod === 'venmo'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Venmo</div>
                  <div className="text-xs text-gray-500">Already paid</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setOrderPaymentMethod('other')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  orderPaymentMethod === 'other'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">Other</div>
                  <div className="text-xs text-gray-500">Mark as paid</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Method
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOrderShippingMethod('pickup')}
                className={`flex-1 p-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  orderShippingMethod === 'pickup'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Local Pickup (Free)
              </button>
              <button
                type="button"
                onClick={() => setOrderShippingMethod('ups')}
                className={`flex-1 p-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  orderShippingMethod === 'ups'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                UPS Shipping (+$8)
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              {orderPaymentMethod === 'stripe' ? 'Create Order & Payment Link' : 'Create Order (Paid)'}
            </button>
            <button
              type="button"
              onClick={() => setShowOrderForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Converted Order Link */}
      {convertedOrderId && (
        <div className="flex items-center gap-2 text-sm bg-green-50 text-green-800 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Converted to order</span>
          <a
            href={`/admin/orders?status=all`}
            className="inline-flex items-center gap-1 font-medium text-green-700 hover:text-green-900 underline"
          >
            View Order <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Status action buttons */}
      {!showQuoteForm && !showOrderForm && actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            const isDecline = action.next === 'declined'
            const isQuote = action.next === 'quoted'

            if (isQuote) {
              return (
                <button
                  key={action.next}
                  onClick={() => setShowQuoteForm(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              )
            }

            return (
              <button
                key={action.next}
                onClick={() => handleStatusUpdate(action.next)}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDecline
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {action.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Create Order button - shown for approved status when not already converted */}
      {!showQuoteForm && !showOrderForm && currentStatus === 'approved' && !convertedOrderId && quotedPrice && (
        <button
          onClick={() => setShowOrderForm(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Create Order
        </button>
      )}

      {/* Quoted price display */}
      {quotedPrice && currentStatus !== 'new' && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Quoted:</span> ${quotedPrice.toFixed(2)}
        </div>
      )}
    </div>
  )
}
