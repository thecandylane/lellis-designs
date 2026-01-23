'use client'

import Image from 'next/image'
import type { Button } from '@/lib/types'
import { cn } from '@/lib/utils'

type ButtonCardProps = {
  button: Button
  onClick: () => void
  accentColor?: string
  featured?: boolean
}

export default function ButtonCard({ button, onClick, accentColor, featured }: ButtonCardProps) {
  const color = accentColor || '#461D7C'

  return (
    <button
      onClick={onClick}
      className={cn(
        "group bg-card rounded-lg border border-border shadow-sm",
        "hover:shadow-xl hover:-translate-y-1",
        "transition-all duration-300 ease-out",
        "overflow-hidden text-left w-full relative",
        featured && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Accent bar with hover animation */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10 transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: color }}
      />

      {/* Featured badge */}
      {featured && (
        <div
          className="absolute top-3 right-3 z-20 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg"
          style={{ backgroundColor: color }}
        >
          Featured
        </div>
      )}

      <div className="aspect-square relative bg-muted overflow-hidden">
        <Image
          src={button.image_url}
          alt={button.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors duration-200">
          {button.name}
        </h3>
        <p style={{ color }} className="font-medium">${button.price.toFixed(2)}</p>
      </div>
    </button>
  )
}
