'use client'

import { memo } from 'react'
import Image from 'next/image'
import { X, Minus, Plus } from 'lucide-react'
import type { CartItem as CartItemType } from '@/lib/types'
import { useCart, getItemKey } from '@/lib/store'

type CartItemProps = {
  item: CartItemType
  pricePerItem: number
}

function CartItem({ item, pricePerItem }: CartItemProps) {
  const updateQuantity = useCart((state) => state.updateQuantity)
  const removeItem = useCart((state) => state.removeItem)
  const itemKey = getItemKey(item)

  const lineTotal = item.quantity * pricePerItem

  return (
    <div className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
      <div className="w-20 h-20 relative shrink-0 bg-muted rounded-lg overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>

        {(item.personName || item.personNumber || item.notes) && (
          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
            {item.personName && <p>Name: {item.personName}</p>}
            {item.personNumber && <p>Number/Class: {item.personNumber}</p>}
            {item.notes && <p className="truncate">Notes: {item.notes}</p>}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(itemKey)}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove item"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="font-bold text-primary">${lineTotal.toFixed(2)}</p>
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders when other cart items change
export default memo(CartItem)
