'use client'

import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import type { Button } from '@/lib/types'
import { cn } from '@/lib/utils'
import { usePricing } from '@/lib/usePricing'

type ButtonCardProps = {
  button: Button
  onClick: () => void
  accentColor?: string
  featured?: boolean
}

export default function ButtonCard({ button, onClick, accentColor, featured }: ButtonCardProps) {
  const { pricing, loading } = usePricing()
  const color = accentColor || '#461D7C'
  const isCustomizable = button.customization === 'customizable'

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center",
        "transition-all duration-300 ease-out",
      )}
    >
      {/* Circular image container */}
      <div className="relative">
        {/* Pulsing glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-secondary/30 blur-xl opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />

        <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl transition-all duration-300 ease-out">
          <Image
            src={button.image_url}
            alt={button.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 176px, 192px"
          />

          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Featured badge */}
        {featured && (
          <div
            className="absolute top-1 right-1 z-20 px-2 py-0.5 text-xs font-bold text-white rounded-full shadow-lg"
            style={{ backgroundColor: color }}
          >
            Featured
          </div>
        )}

        {/* Customizable sparkle badge */}
        {isCustomizable && (
          <div
            className="absolute top-1 left-1 z-20 flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded-full shadow-lg"
            style={{ backgroundColor: color }}
            title="Customizable"
          >
            <Sparkles className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Name + Price below circle */}
      <div className="mt-3 text-center max-w-[130px] sm:max-w-[160px] md:max-w-[190px]">
        <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {button.name}
        </h3>
        <p style={{ color }} className="font-medium text-sm mt-0.5">
          {loading ? '...' : `$${pricing.singlePrice.toFixed(2)}`}
        </p>
      </div>
    </button>
  )
}
