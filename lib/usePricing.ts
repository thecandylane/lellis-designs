'use client'

import { useState, useEffect } from 'react'

export type PricingConfig = {
  singlePrice: number
  tier1Price: number
  tier1Threshold: number
  tier2Price: number
  tier2Threshold: number
  shippingCost: number
}

const DEFAULT_PRICING: PricingConfig = {
  singlePrice: 5,
  tier1Price: 4.5,
  tier1Threshold: 100,
  tier2Price: 4,
  tier2Threshold: 200,
  shippingCost: 8,
}

// Cache pricing to avoid refetching on every component mount
let cachedPricing: PricingConfig | null = null
let cachePromise: Promise<PricingConfig> | null = null

async function fetchPricing(): Promise<PricingConfig> {
  const response = await fetch('/api/settings/pricing')
  if (!response.ok) {
    throw new Error('Failed to fetch pricing')
  }
  return response.json()
}

export function usePricing() {
  const [pricing, setPricing] = useState<PricingConfig>(cachedPricing || DEFAULT_PRICING)
  const [loading, setLoading] = useState(!cachedPricing)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already cached, we're done
    if (cachedPricing) {
      setPricing(cachedPricing)
      setLoading(false)
      return
    }

    // If a fetch is already in progress, wait for it
    if (!cachePromise) {
      cachePromise = fetchPricing()
    }

    cachePromise
      .then((data) => {
        cachedPricing = data
        setPricing(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch pricing:', err)
        setError('Failed to load pricing')
        setLoading(false)
        // Reset promise so next mount can retry
        cachePromise = null
      })
  }, [])

  return { pricing, loading, error }
}

// Calculate price per button based on total quantity
export function getPricePerButton(quantity: number, pricing: PricingConfig): number {
  if (quantity >= pricing.tier2Threshold) return pricing.tier2Price
  if (quantity >= pricing.tier1Threshold) return pricing.tier1Price
  return pricing.singlePrice
}

// Get the next discount tier info (for UI messaging)
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
