'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus } from 'lucide-react'
import type { Button } from '@/lib/types'
import { useCart } from '@/lib/store'
import { cn } from '@/lib/utils'

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

  const color = accentColor || '#461D7C'
  const isCustomizable = button.customization === 'customizable'

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
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg relative">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg z-10"
          style={{ backgroundColor: color }}
        />

        <div className="relative aspect-square bg-muted">
          <Image
            src={button.image_url}
            alt={button.name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, 512px"
          />
          <button
            onClick={onClose}
            className={cn(
              "absolute top-2 right-2 rounded-full p-2 transition-colors",
              "bg-background/90 hover:bg-background text-foreground"
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">{button.name}</h2>
          {button.description && (
            <p className="text-muted-foreground mb-4">{button.description}</p>
          )}
          <p className="text-xl font-semibold mb-6" style={{ color }}>
            ${button.price.toFixed(2)} each
          </p>

          <div className="space-y-4">
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
  )
}
