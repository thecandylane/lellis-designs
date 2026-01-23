import ButtonCardSkeleton from './ButtonCardSkeleton'

type ButtonGridSkeletonProps = {
  count?: number
}

export default function ButtonGridSkeleton({ count = 8 }: ButtonGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ButtonCardSkeleton key={i} />
      ))}
    </div>
  )
}
