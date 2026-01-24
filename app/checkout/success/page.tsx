'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/store'
import { Suspense } from 'react'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const clearCart = useCart((state) => state.clearCart)

  useEffect(() => {
    // Clear the cart after successful checkout
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Logo */}
        <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-primary/20">
          <Image
            src="/logo.png"
            alt="L. Ellis Designs"
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Thank you for your order!
        </h1>

        <p className="text-muted-foreground mb-8">
          We&apos;ve received your order and will start working on your custom buttons soon.
          You&apos;ll receive a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 px-6 rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-[1.02]"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {sessionId && (
          <p className="mt-8 text-xs text-muted-foreground">
            Order reference: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
