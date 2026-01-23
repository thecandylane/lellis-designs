import Link from 'next/link'
import { Folder, Circle } from 'lucide-react'
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
  subcategoryCount = 0,
  buttonCount = 0,
  className,
  accentColor
}: CategoryCardProps) {
  const hasSubcategories = subcategoryCount > 0
  const hasButtons = buttonCount > 0

  // Use category's own colors if available, otherwise use passed accent or LSU purple/gold
  const primaryColor = category.color_primary || accentColor || '#461D7C'
  const secondaryColor = category.color_secondary || '#FDD023'

  return (
    <Link
      href={href}
      className={cn(
        "group relative bg-card rounded-xl border-2 border-border/50",
        "shadow-md hover:shadow-2xl hover:-translate-y-2",
        "transition-all duration-300 ease-out",
        "p-5 pt-6 text-center flex flex-col items-center gap-2 overflow-hidden",
        "min-h-[140px]",
        className
      )}
      style={{
        '--card-accent': primaryColor,
        '--card-accent-light': `${primaryColor}15`,
      } as React.CSSProperties}
    >
      {/* Subtle gradient background fill */}
      <div
        className="absolute inset-0 opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.08]"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      />

      {/* Color accent bar at top with hover animation */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl transition-all duration-300 group-hover:h-2"
        style={{
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      />

      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{
          backgroundColor: `${primaryColor}15`,
          boxShadow: `0 4px 12px ${primaryColor}20`,
        }}
      >
        {hasSubcategories ? (
          <Folder className="h-7 w-7 transition-transform duration-300" style={{ color: primaryColor }} />
        ) : (
          <Circle className="h-7 w-7 transition-transform duration-300" style={{ color: primaryColor }} />
        )}
      </div>

      <h3 className="text-base font-bold text-card-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
        {category.name}
      </h3>

      {(hasSubcategories || hasButtons) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          {hasSubcategories && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <Folder className="h-3 w-3" />
              {subcategoryCount}
            </span>
          )}
          {hasButtons && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
            >
              <Circle className="h-3 w-3" />
              {buttonCount}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
