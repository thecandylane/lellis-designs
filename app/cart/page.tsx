'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart, getPricePerButton, getNextTierInfo } from '@/lib/store'
import CartItem from '@/components/cart/CartItem'
import { Truck, MapPin, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const items = useCart((state) => state.items)
  const email = useCart((state) => state.email)
  const neededByDate = useCart((state) => state.neededByDate)
  const shippingMethod = useCart((state) => state.shippingMethod)
  const setEmail = useCart((state) => state.setEmail)
  const setNeededByDate = useCart((state) => state.setNeededByDate)
  const setShippingMethod = useCart((state) => state.setShippingMethod)
  const getTotal = useCart((state) => state.getTotal)
  const getTotalQuantity = useCart((state) => state.getTotalQuantity)
  const getShippingCost = useCart((state) => state.getShippingCost)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalQuantity = getTotalQuantity()
  const pricePerItem = getPricePerButton(totalQuantity)
  const subtotal = totalQuantity * pricePerItem
  const shippingCost = getShippingCost()
  const total = getTotal()
  const nextTier = getNextTierInfo(totalQuantity)
  const basePricePerItem = 5 // For calculating savings

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    if (!neededByDate) {
      setError('Please select when you need your order')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email,
          neededByDate,
          shippingMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-glow">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="bg-card rounded-2xl shadow-lg p-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t added any buttons yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-full transition-all hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-glow">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your Cart</h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item, index) => (
            <CartItem key={`${item.buttonId}-${index}`} item={item} pricePerItem={pricePerItem} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {totalQuantity} item{totalQuantity !== 1 ? 's' : ''} @ ${pricePerItem.toFixed(2)} each
              </span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          {pricePerItem < basePricePerItem ? (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">
              Bulk discount applied! You&apos;re saving ${((basePricePerItem - pricePerItem) * totalQuantity).toFixed(2)}
              {nextTier && (
                <span className="block mt-1 text-green-600">
                  Add {nextTier.threshold - totalQuantity} more for ${nextTier.price.toFixed(2)}/each
                </span>
              )}
            </div>
          ) : nextTier ? (
            <div className="bg-secondary/20 text-secondary-foreground text-sm p-3 rounded-lg">
              Add {nextTier.threshold - totalQuantity} more button{nextTier.threshold - totalQuantity !== 1 ? 's' : ''} for bulk pricing (${nextTier.price.toFixed(2)} each)
            </div>
          ) : null}
        </div>

        {/* Checkout Form */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
          {/* Delivery Method */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShippingMethod('pickup')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  shippingMethod === 'pickup'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`p-2 rounded-full ${shippingMethod === 'pickup' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <MapPin className={`h-5 w-5 ${shippingMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${shippingMethod === 'pickup' ? 'text-primary' : 'text-foreground'}`}>
                    Local Pickup
                  </p>
                  <p className="text-sm text-muted-foreground">FREE - Baton Rouge area</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod('ups')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  shippingMethod === 'ups'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`p-2 rounded-full ${shippingMethod === 'ups' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Truck className={`h-5 w-5 ${shippingMethod === 'ups' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${shippingMethod === 'ups' ? 'text-primary' : 'text-foreground'}`}>
                    UPS Shipping
                  </p>
                  <p className="text-sm text-muted-foreground">$8.00 flat rate</p>
                </div>
              </button>
            </div>

            {shippingMethod === 'pickup' && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-3">
                Pickup address will be provided via email once your order is ready.
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-input bg-background rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="neededBy" className="block text-sm font-medium text-foreground mb-2">
                  Needed By Date *
                </label>
                <input
                  type="date"
                  id="neededBy"
                  value={neededByDate || ''}
                  onChange={(e) => setNeededByDate(e.target.value)}
                  className="w-full border border-input bg-background rounded-lg py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold py-4 px-6 rounded-full transition-all hover:scale-[1.02] disabled:hover:scale-100"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
