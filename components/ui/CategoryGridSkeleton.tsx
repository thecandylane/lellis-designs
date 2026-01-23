import CategoryCardSkeleton from './CategoryCardSkeleton'

type CategoryGridSkeletonProps = {
  count?: number
}

export default function CategoryGridSkeleton({ count = 8 }: CategoryGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}
