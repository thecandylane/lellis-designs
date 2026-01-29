'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

type Props = {
  tags: string[]
  paramName?: string
}

export default function TagFilter({ tags, paramName = 'tag' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedTags = searchParams.getAll(paramName)

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll(paramName)

    // Remove all existing tag params
    params.delete(paramName)

    if (current.includes(tag)) {
      // Remove this tag
      current.filter(t => t !== tag).forEach(t => params.append(paramName, t))
    } else {
      // Add this tag
      current.forEach(t => params.append(paramName, t))
      params.append(paramName, tag)
    }

    // Reset to page 1 when changing filters
    params.delete('page')

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearTags = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(paramName)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Tags:</span>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedTags.includes(tag)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          {tag}
          {selectedTags.includes(tag) && (
            <X className="inline-block w-3 h-3 ml-1" />
          )}
        </button>
      ))}
      {selectedTags.length > 0 && (
        <button
          onClick={clearTags}
          className="text-xs text-muted-foreground hover:text-foreground ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
