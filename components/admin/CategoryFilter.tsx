'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMemo, useCallback } from 'react'

type Category = {
  id: string
  name: string
  parentId: string | null
  buttonCount?: number
  totalButtonCount?: number
}

type Props = {
  categories: Category[]
  totalButtons: number
  uncategorizedCount: number
}

export default function CategoryFilter({ categories, totalButtons, uncategorizedCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''

  // Build the path from root to current selection
  const selectionPath = useMemo(() => {
    if (!currentCategory) return []
    if (currentCategory === 'uncategorized') return ['uncategorized']

    const path: string[] = []
    let current = currentCategory

    // Walk up the tree to build the path
    while (current) {
      path.unshift(current)
      const cat = categories.find(c => String(c.id) === current)
      if (cat?.parentId) {
        current = String(cat.parentId)
      } else {
        break
      }
    }

    return path
  }, [currentCategory, categories])

  // Get children of a category
  const getChildren = useCallback((parentId: string | null): Category[] => {
    if (parentId === null) {
      return categories.filter(c => c.parentId === null)
    }
    return categories.filter(c => String(c.parentId) === parentId)
  }, [categories])

  // Build dropdown levels based on current selection
  const dropdownLevels = useMemo(() => {
    const levels: { parentId: string | null; parentName: string; parentTotalCount: number; children: Category[] }[] = []

    // First level: root categories
    const rootChildren = getChildren(null)
    if (rootChildren.length > 0 || uncategorizedCount > 0) {
      levels.push({ parentId: null, parentName: 'All', parentTotalCount: totalButtons, children: rootChildren })
    }

    // Subsequent levels based on selection path
    for (let i = 0; i < selectionPath.length; i++) {
      const selectedId = selectionPath[i]
      if (selectedId === 'uncategorized') break

      const children = getChildren(selectedId)
      if (children.length > 0) {
        const selectedCat = categories.find(c => String(c.id) === selectedId)
        levels.push({
          parentId: selectedId,
          parentName: selectedCat?.name || 'Selected',
          parentTotalCount: selectedCat?.totalButtonCount ?? 0,
          children
        })
      }
    }

    return levels
  }, [selectionPath, categories, uncategorizedCount, totalButtons, getChildren])

  const handleChange = (level: number, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' && level === 0) {
      // Clear category filter entirely
      params.delete('category')
    } else if (value === 'all') {
      // Go back to parent level
      const parentId = selectionPath[level - 1] || ''
      if (parentId) {
        params.set('category', parentId)
      } else {
        params.delete('category')
      }
    } else {
      // Set new category
      params.set('category', value)
    }

    // Reset to page 1 when changing category
    params.delete('page')

    router.push(`${pathname}?${params.toString()}`)
  }

  if (categories.length === 0 && uncategorizedCount === 0) {
    return null
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {dropdownLevels.map((level, index) => {
        const isFirstLevel = index === 0
        const currentSelection = selectionPath[index] || 'all'

        return (
          <div key={level.parentId ?? 'root'} className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground/80">
              {isFirstLevel ? 'Category:' : `${level.parentName}:`}
            </label>
            <select
              value={currentSelection}
              onChange={(e) => handleChange(index, e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {isFirstLevel ? (
                <>
                  <option value="all">All Categories ({totalButtons})</option>
                  {uncategorizedCount > 0 && (
                    <option value="uncategorized">Uncategorized ({uncategorizedCount})</option>
                  )}
                </>
              ) : (
                <option value="all">All in {level.parentName} ({level.parentTotalCount})</option>
              )}
              {level.children.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.totalButtonCount ?? 0})
                </option>
              ))}
            </select>
          </div>
        )
      })}

      {currentCategory && (
        <button
          onClick={() => handleChange(0, 'all')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
