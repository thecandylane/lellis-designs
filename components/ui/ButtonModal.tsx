'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, Clock, Sparkles } from 'lucide-react'
import type { Button } from '@/lib/types'
import { useCart } from '@/lib/store'
import { cn } from '@/lib/utils'
import { usePricing } from '@/lib/usePricing'
import { Badge } from '@/components/ui/badge'

type ButtonModalProps = {
  button: Button
  onClose: () => void
  accentColor?: string
}

export default function ButtonModal({ button, onClose, accentColor }: ButtonModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [personName, setPersonName] = useState('')
  const [personNumber, setPersonNumber] = useState('')
  const [notes, setNotes] = useState('')
  const addItem = useCart((state) => state.addItem)
  const { pricing, loading } = usePricing()

  const color = accentColor || '#461D7C'
  const isCustomizable = button.customization === 'customizable'
  const hasTags = button.tags && button.tags.length > 0

  const handleAddToCart = () => {
    addItem({
      buttonId: button.id,
      name: button.name,
      imageUrl: button.image_url,
      price: button.price,
      quantity,
      ...(isCustomizable && personName ? { personName } : {}),
      ...(isCustomizable && personNumber ? { personNumber } : {}),
      ...(isCustomizable && notes ? { notes } : {}),
    })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-lg max-w-lg md:max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg relative">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg z-10"
          style={{ backgroundColor: color }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 z-20 rounded-full p-2 transition-colors",
            "bg-background/90 hover:bg-background text-foreground"
          )}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Side-by-side layout on md+, stacked on mobile */}
        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="relative aspect-square md:w-1/2 bg-muted flex-shrink-0">
            <Image
              src={button.image_url}
              alt={button.name}
              fill
              className="object-cover md:rounded-l-lg md:rounded-tr-none rounded-t-lg"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>

          {/* Details section */}
          <div className="p-6 md:w-1/2 flex flex-col">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">{button.name}</h2>

            {button.description && (
              <p className="text-muted-foreground mb-3">{button.description}</p>
            )}

            {/* Tags */}
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {button.tags!.map(({ tag }) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Customizable badge */}
            {isCustomizable && (
              <Badge
                className="w-fit mb-3 gap-1"
                style={{ backgroundColor: color }}
                title="Add your name, number, or custom text to this design"
              >
                <Sparkles className="h-3 w-3" />
                Customizable
              </Badge>
            )}

            <p className="text-xl font-semibold mb-2" style={{ color }}>
              {loading ? '...' : `$${pricing.singlePrice.toFixed(2)}`} each
            </p>

            {/* Lead time */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span>Ready in ~{button.lead_time_days} days</span>
            </div>

            {/* Bulk pricing hint */}
            <p className="text-sm text-muted-foreground mb-4">
              <span className="underline underline-offset-2 cursor-help" title="Contact us for bulk order pricing">
                Order 25+ for volume discounts
              </span>
            </p>

            <div className="space-y-4 flex-grow">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-card-foreground mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-secondary-foreground transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-input rounded-md py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': color } as React.CSSProperties}
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-secondary-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isCustomizable && (
                <>
                  <div>
                    <label htmlFor="personName" className="block text-sm font-medium text-card-foreground mb-1">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      id="personName"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full border border-input rounded-md py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      placeholder="Enter name for button"
                    />
                  </div>

                  <div>
                    <label htmlFor="personNumber" className="block text-sm font-medium text-card-foreground mb-1">
                      Number / Class (optional)
                    </label>
                    <input
                      type="text"
                      id="personNumber"
                      value={personNumber}
                      onChange={(e) => setPersonNumber(e.target.value)}
                      className="w-full border border-input rounded-md py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      placeholder="e.g., #12 or Class of 2025"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-card-foreground mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-input rounded-md py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      rows={2}
                      placeholder="Any special instructions"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full mt-6 text-white font-semibold py-3 px-6 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
