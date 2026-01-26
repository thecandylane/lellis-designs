'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type FilterOption = {
  value: string
  label: string
  count?: number
}

type Props = {
  paramName?: string
  options: FilterOption[]
  defaultValue?: string
}

export default function FilterTabs({ paramName = 'status', options, defaultValue = 'all' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentValue = searchParams.get(paramName) || defaultValue

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === defaultValue) {
      params.delete(paramName)
    } else {
      params.set(paramName, value)
    }

    // Reset to page 1 when changing filters
    params.delete('page')

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentValue === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={`ml-1.5 ${currentValue === option.value ? 'opacity-80' : 'text-muted-foreground'}`}>
              ({option.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
