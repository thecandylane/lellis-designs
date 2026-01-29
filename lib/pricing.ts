/**
 * Shared pricing utilities
 * Used by both client-side (usePricing hook) and server-side (checkout API)
 */

export type PricingConfig = {
  singlePrice: number
  tier1Price: number
  tier1Threshold: number
  tier2Price: number
  tier2Threshold: number
  shippingCost: number
}

export const DEFAULT_PRICING: PricingConfig = {
  singlePrice: 5,
  tier1Price: 4.5,
  tier1Threshold: 100,
  tier2Price: 4,
  tier2Threshold: 200,
  shippingCost: 8,
}

/**
 * Calculate price per button based on total quantity
 * Applies volume discounts automatically
 *
 * @param quantity - Total number of buttons
 * @param pricing - Pricing configuration
 * @returns Price per button in dollars
 *
 * @example
 * ```ts
 * getPricePerButton(50, pricing)   // $5.00 (single price)
 * getPricePerButton(150, pricing)  // $4.50 (tier 1 discount)
 * getPricePerButton(250, pricing)  // $4.00 (tier 2 discount)
 * ```
 */
export function getPricePerButton(quantity: number, pricing: PricingConfig): number {
  if (quantity >= pricing.tier2Threshold) return pricing.tier2Price
  if (quantity >= pricing.tier1Threshold) return pricing.tier1Price
  return pricing.singlePrice
}

/**
 * Get the next discount tier info for UI messaging
 * Returns null if already at the best price tier
 *
 * @param quantity - Current quantity
 * @param pricing - Pricing configuration
 * @returns Next tier threshold and price, or null if at max discount
 *
 * @example
 * ```ts
 * getNextTierInfo(50, pricing)   // { threshold: 100, price: 4.5 }
 * getNextTierInfo(150, pricing)  // { threshold: 200, price: 4.0 }
 * getNextTierInfo(250, pricing)  // null (already at best price)
 * ```
 */
export function getNextTierInfo(
  quantity: number,
  pricing: PricingConfig
): { threshold: number; price: number } | null {
  if (quantity >= pricing.tier2Threshold) return null // Already at best price
  if (quantity >= pricing.tier1Threshold) {
    return { threshold: pricing.tier2Threshold, price: pricing.tier2Price }
  }
  return { threshold: pricing.tier1Threshold, price: pricing.tier1Price }
}

/**
 * Calculate subtotal for an order (before shipping)
 *
 * @param quantity - Total quantity of buttons
 * @param pricing - Pricing configuration
 * @returns Subtotal in dollars
 */
export function calculateSubtotal(quantity: number, pricing: PricingConfig): number {
  return quantity * getPricePerButton(quantity, pricing)
}

/**
 * Calculate total for an order (including shipping)
 *
 * @param quantity - Total quantity of buttons
 * @param pricing - Pricing configuration
 * @param includeShipping - Whether to include shipping cost (default: true)
 * @returns Total in dollars
 */
export function calculateTotal(
  quantity: number,
  pricing: PricingConfig,
  includeShipping = true
): number {
  const subtotal = calculateSubtotal(quantity, pricing)
  return includeShipping ? subtotal + pricing.shippingCost : subtotal
}
