import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import type { BreadcrumbItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

type CategoryBreadcrumbProps = {
  items: BreadcrumbItem[]
  className?: string
  style?: CSSProperties
}

export default function CategoryBreadcrumb({ items, className, style }: CategoryBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)} style={style}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isFirst = index === 0

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 opacity-60 shrink-0" />
              )}
              {isLast ? (
                <span className="font-medium">
                  {isFirst ? <Home className="h-4 w-4" /> : item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  {isFirst ? <Home className="h-4 w-4" /> : item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
