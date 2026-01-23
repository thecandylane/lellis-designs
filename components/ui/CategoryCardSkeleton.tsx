import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type CategoryCardSkeletonProps = {
  className?: string
}

export default function CategoryCardSkeleton({ className }: CategoryCardSkeletonProps) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-lg border border-border shadow-sm p-6 pt-7 flex flex-col items-center gap-3 overflow-hidden",
        className
      )}
    >
      {/* Accent bar skeleton */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Icon skeleton */}
      <Skeleton className="w-12 h-12 rounded-full" />

      {/* Title skeleton */}
      <Skeleton className="h-6 w-24" />

      {/* Badge skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  )
}
