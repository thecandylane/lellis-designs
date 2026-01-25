import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

type CategoryCardProps = {
  category: Category
  href: string
  subcategoryCount?: number
  buttonCount?: number
  className?: string
  accentColor?: string
}

export default function CategoryCard({
  category,
  href,
  className,
}: CategoryCardProps) {
  // Use category's own colors if available, otherwise use defaults
  const primaryColor = category.color_primary || '#461D7C'
  const secondaryColor = category.color_secondary || '#FDD023'

  // Generate a unique ID for this category's SVG path
  const curveId = `curve-${category.id}`

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center",
        className
      )}
    >
      {/* Container for button and curved text */}
      <div className="relative">
        {/* Pulsing glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-secondary/30 blur-xl opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />

        {/* Circular button shape - Much larger now */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl transition-all duration-300 ease-out">
          {category.icon ? (
            <Image
              src={category.icon}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
            />
          ) : (
            /* Gradient fallback using category colors */
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            />
          )}

          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Curved text using SVG - positioned below the circle */}
        <svg
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[140%] h-16 sm:h-20 overflow-visible pointer-events-none"
          viewBox="0 0 200 60"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <path
              id={curveId}
              d="M 10,10 Q 100,55 190,10"
              fill="none"
            />
          </defs>
          <text
            className="fill-gray-800 group-hover:fill-primary transition-colors duration-200"
            style={{
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            <textPath
              href={`#${curveId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {category.name}
            </textPath>
          </text>
        </svg>
      </div>
    </Link>
  )
}
