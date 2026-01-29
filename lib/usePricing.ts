'use client'

import { useState, useEffect } from 'react'
import type { PricingConfig } from './pricing'
import { DEFAULT_PRICING, getPricePerButton, getNextTierInfo } from './pricing'

// Re-export for backward compatibility
export type { PricingConfig }
export { getPricePerButton, getNextTierInfo }

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
