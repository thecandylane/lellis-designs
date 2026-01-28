import type { Category } from '@/lib/types'
import CategoryCard from './CategoryCard'
import { cn } from '@/lib/utils'

type CategoryInfo = {
  category: Category
  href: string
  subcategoryCount?: number
  buttonCount?: number
  previewImage?: string | null
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
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full flex flex-wrap justify-center lg:justify-between gap-8 sm:gap-10 md:gap-12 lg:gap-8",
      className
    )}>
      {categories.map(({ category, href, subcategoryCount, buttonCount, previewImage }) => (
        <CategoryCard
          key={category.id}
          category={category}
          href={href}
          subcategoryCount={subcategoryCount}
          buttonCount={buttonCount}
          previewImage={previewImage}
        />
      ))}
    </div>
  )
}
