'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AmbassadorTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      // Set cookie for 30 days
      document.cookie = `ambassador_code=${encodeURIComponent(ref)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
    }
  }, [searchParams])

  return null
}
