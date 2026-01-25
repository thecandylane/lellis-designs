'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ButtonPit = dynamic(() => import('./ButtonPit'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-primary via-primary to-secondary" />
  )
})

interface ButtonImage {
  id: string
  image_url: string
}

export default function HeroButtonPit() {
  const [buttonImages, setButtonImages] = useState<string[]>([])

  useEffect(() => {
    // Fetch random button images from the API for textures
    async function fetchButtonImages() {
      try {
        const res = await fetch('/api/buttons/random?limit=20')
        if (res.ok) {
          const data = await res.json()
          const urls = data.buttons?.map((b: ButtonImage) => b.image_url).filter(Boolean) || []
          setButtonImages(urls)
        }
      } catch (err) {
        // Silent fail - will just use colored buttons without textures
        console.warn('Could not fetch button images for pit:', err)
      }
    }

    fetchButtonImages()
  }, [])

  return (
    <div className="absolute inset-0">
      <ButtonPit
        count={80}
        gravity={0.01}
        friction={0.9975}
        wallBounce={0.95}
        followCursor={true}
        colors={[0x14b8a6, 0xec4899, 0x84cc16, 0xa855f7, 0xf97316]}
        minSize={0.4}
        maxSize={1.2}
        buttonImages={buttonImages}
      />
    </div>
  )
}
