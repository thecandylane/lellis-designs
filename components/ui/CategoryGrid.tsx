import type { Category } from '@/lib/types'
import CategoryCard from './CategoryCard'
import { cn } from '@/lib/utils'

type CategoryInfo = {
  category: Category
  href: string
  subcategoryCount?: number
  buttonCount?: number
}

type CategoryGridProps = {
  categories: CategoryInfo[]
  className?: string
  emptyMessage?: string
  accentColor?: string
}

export default function CategoryGrid({
  categories,
  className,
  emptyMessage = "No categories found",
  accentColor
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Determine grid columns based on number of items
  const gridClass = categories.length <= 2
    ? "grid grid-cols-2 max-w-lg mx-auto gap-4"
    : categories.length <= 4
    ? "grid grid-cols-2 md:grid-cols-4 gap-4"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"

  return (
    <div className={cn(gridClass, className)}>
      {categories.map(({ category, href, subcategoryCount, buttonCount }) => (
        <CategoryCard
          key={category.id}
          category={category}
          href={href}
          subcategoryCount={subcategoryCount}
          buttonCount={buttonCount}
          accentColor={accentColor || category.color_primary || undefined}
        />
      ))}
    </div>
  )
}
