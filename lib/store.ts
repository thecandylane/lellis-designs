import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/lib/types'

export type { CartItem }

export type ShippingMethod = 'pickup' | 'ups'

type CartStore = {
  items: CartItem[]
  email: string | null
  neededByDate: string | null
  shippingMethod: ShippingMethod
  addItem: (item: CartItem) => void
  removeItem: (itemKey: string) => void
  updateQuantity: (itemKey: string, quantity: number) => void
  setEmail: (email: string) => void
  setNeededByDate: (date: string) => void
  setShippingMethod: (method: ShippingMethod) => void
  clearCart: () => void
  getTotalQuantity: () => number
  getItemCount: () => number
}

// Generate unique key for cart item (same button with different customizations = different items)
function getItemKey(item: CartItem): string {
  return `${item.buttonId}-${item.personName || ''}-${item.personNumber || ''}-${item.notes || ''}`
}

// Re-export pricing utilities from usePricing for convenience
// These functions now require a pricing config parameter
export { getPricePerButton, getNextTierInfo } from '@/lib/usePricing'
export type { PricingConfig } from '@/lib/usePricing'

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      email: null,
      neededByDate: null,
      shippingMethod: 'pickup' as ShippingMethod,

      addItem: (item) => {
        const items = get().items
        const itemKey = getItemKey(item)
        const existingIndex = items.findIndex(i => getItemKey(i) === itemKey)

        if (existingIndex >= 0) {
          const newItems = [...items]
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity
          }
          set({ items: newItems })
        } else {
          set({ items: [...items, item] })
        }
      },

      removeItem: (itemKey) => {
        set({ items: get().items.filter(i => getItemKey(i) !== itemKey) })
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey)
        } else {
          set({
            items: get().items.map(i =>
              getItemKey(i) === itemKey ? { ...i, quantity } : i
            )
          })
        }
      },

      setEmail: (email) => set({ email }),
      setNeededByDate: (date) => set({ neededByDate: date }),
      setShippingMethod: (method) => set({ shippingMethod: method }),
      clearCart: () => set({ items: [], email: null, neededByDate: null, shippingMethod: 'pickup' }),

      getTotalQuantity: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'lellis-cart-storage',
    }
  )
)

// Export the getItemKey function for use in components
export { getItemKey }
