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
  getTotal: () => number
  getTotalQuantity: () => number
  getItemCount: () => number
  getShippingCost: () => number
}

// Generate unique key for cart item (same button with different customizations = different items)
function getItemKey(item: CartItem): string {
  return `${item.buttonId}-${item.personName || ''}-${item.personNumber || ''}-${item.notes || ''}`
}

// Flat rate shipping cost for UPS
const UPS_SHIPPING_COST = 8.00

// Pricing tiers
const PRICING = {
  base: 5.00,        // Under 100 buttons
  tier1: 4.50,       // 100-199 buttons
  tier1Min: 100,
  tier2: 4.00,       // 200+ buttons
  tier2Min: 200,
}

// Calculate price per button based on total quantity
export function getPricePerButton(quantity: number): number {
  if (quantity >= PRICING.tier2Min) return PRICING.tier2
  if (quantity >= PRICING.tier1Min) return PRICING.tier1
  return PRICING.base
}

// Get the next discount tier info (for UI messaging)
export function getNextTierInfo(quantity: number): { threshold: number; price: number } | null {
  if (quantity >= PRICING.tier2Min) return null // Already at best price
  if (quantity >= PRICING.tier1Min) return { threshold: PRICING.tier2Min, price: PRICING.tier2 }
  return { threshold: PRICING.tier1Min, price: PRICING.tier1 }
}

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

      getShippingCost: () => {
        return get().shippingMethod === 'ups' ? UPS_SHIPPING_COST : 0
      },

      getTotal: () => {
        const totalQuantity = get().getTotalQuantity()
        const pricePerItem = getPricePerButton(totalQuantity)
        const subtotal = pricePerItem * totalQuantity
        const shippingCost = get().getShippingCost()
        return subtotal + shippingCost
      },

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
