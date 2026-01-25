'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Category = {
  id: string
  name: string
}

type Props = {
  categories: Category[]
}

export default function CategoryFilter({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === 'all') {
      params.delete('category')
    } else {
      params.set('category', categoryId)
    }
    const queryString = params.toString()
    router.push(`/admin/buttons${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
      <div className="flex items-start sm:items-center gap-3">
        <span className="text-sm font-medium text-foreground/80 whitespace-nowrap pt-1.5 sm:pt-0">Filter:</span>
        <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1 -mb-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap min-h-9 flex items-center ${
              currentCategory === 'all'
                ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-2 ring-offset-background font-medium shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap min-h-9 flex items-center ${
                currentCategory === cat.id
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-2 ring-offset-background font-medium shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
