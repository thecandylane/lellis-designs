import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type ButtonCardSkeletonProps = {
  className?: string
}

export default function ButtonCardSkeleton({ className }: ButtonCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border shadow-sm overflow-hidden relative",
        className
      )}
    >
      {/* Accent bar skeleton */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full rounded-none" />

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  )
}
