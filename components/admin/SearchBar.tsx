'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'

type Props = {
  placeholder?: string
  paramName?: string
}

export default function SearchBar({ placeholder = 'Search...', paramName = 'q' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get(paramName) || '')

  // Use a ref for searchParams to avoid recreating the callback on every URL change
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  // Update URL with debounced search
  const updateSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (query) {
        params.set(paramName, query)
      } else {
        params.delete(paramName)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, paramName]
  )

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearch(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value, updateSearch])

  const handleClear = () => {
    setValue('')
    const params = new URLSearchParams(searchParamsRef.current.toString())
    params.delete(paramName)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
