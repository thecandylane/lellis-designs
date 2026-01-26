'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, GripVertical, Star, Check } from 'lucide-react'
import ButtonActions from './ButtonActions'
import BulkActionToolbar from './BulkActionToolbar'
import PaginationControls from '@/components/admin/PaginationControls'

type PayloadButton = {
  id: string
  name: string
  description?: string | null
  image?: { url?: string } | string | null
  category?: { id: string; name: string } | string | null
  price: number
  active: boolean
  featured?: boolean
  sortOrder: number
  createdAt: string
}

type Category = {
  id: string
  name: string
  parentId: string | null
}

type PaginationInfo = {
  currentPage: number
  totalPages: number
  totalDocs: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type Props = {
  buttons: PayloadButton[]
  categories?: Category[]
  pagination?: PaginationInfo
}

export default function SortableButtonGrid({ buttons, categories = [], pagination }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(buttons)
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  // filterPath: Array of category IDs representing the drill-down path
  // [] = "All", ['uncategorized'] = uncategorized, ['cat-1'] = top level, ['cat-1', 'cat-2'] = nested
  const [filterPath, setFilterPath] = useState<string[]>([])

  // Sync local state when props change (e.g., after router.refresh())
  useEffect(() => {
    setItems(buttons)
  }, [buttons])

  // Helper to get category ID from item (handles object or string)
  const getCategoryId = useCallback((item: PayloadButton): string | null => {
    const cat = item.category
    if (!cat) return null
    if (typeof cat === 'object') return cat.id ? String(cat.id) : null
    return String(cat)
  }, [])

  // Recursive function to get all descendant IDs including the parent itself
  const getDescendantIds = useCallback((parentId: string): string[] => {
    const children = categories.filter(c => String(c.parentId) === parentId)
    return [parentId, ...children.flatMap(c => getDescendantIds(c.id))]
  }, [categories])

  // Get children of a specific category
  const getChildCategories = useCallback((parentId: string | null): Category[] => {
    if (parentId === null) {
      return categories.filter(c => c.parentId === null)
    }
    return categories.filter(c => String(c.parentId) === parentId)
  }, [categories])

  // Root categories (where parentId is null)
  const rootCategories = useMemo(() =>
    categories.filter(c => c.parentId === null),
    [categories]
  )

  // Count of uncategorized buttons
  const uncategorizedCount = useMemo(() =>
    items.filter(item => !getCategoryId(item)).length,
    [items, getCategoryId]
  )

  // Build the cascading dropdown data - each level shows children of the selected category
  const dropdownLevels = useMemo(() => {
    const levels: { parentId: string | null; parentName: string; children: Category[] }[] = []

    // First level: root categories
    const rootChildren = getChildCategories(null)
    if (rootChildren.length > 0 || uncategorizedCount > 0) {
      levels.push({ parentId: null, parentName: 'All', children: rootChildren })
    }

    // Subsequent levels based on filterPath
    for (let i = 0; i < filterPath.length; i++) {
      const selectedId = filterPath[i]
      if (selectedId === 'uncategorized') break

      const children = getChildCategories(selectedId)
      if (children.length > 0) {
        const selectedCat = categories.find(c => c.id === selectedId)
        levels.push({
          parentId: selectedId,
          parentName: selectedCat?.name || 'Selected',
          children
        })
      }
    }

    return levels
  }, [filterPath, getChildCategories, categories, uncategorizedCount])

  // Handle dropdown selection at a specific level
  const handleLevelChange = useCallback((level: number, value: string) => {
    if (value === 'all') {
      // Reset to show all at this level - truncate filterPath
      setFilterPath(prev => prev.slice(0, level))
    } else {
      // Set selection at this level and clear deeper levels
      setFilterPath(prev => [...prev.slice(0, level), value])
    }
  }, [])

  // Filter items based on filterPath
  const filteredItems = useMemo(() => {
    if (filterPath.length === 0) {
      return items // Show all
    }

    // Handle uncategorized filter
    if (filterPath[0] === 'uncategorized') {
      return items.filter(item => !getCategoryId(item))
    }

    // Get the deepest selection in the path
    const deepestSelection = filterPath[filterPath.length - 1]
    const relevantIds = getDescendantIds(deepestSelection)

    return items.filter(item => {
      const catId = getCategoryId(item)
      return catId && relevantIds.includes(catId)
    })
  }, [items, filterPath, getCategoryId, getDescendantIds])

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredItems.map(item => item.id)))
  }, [filteredItems])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Calculate new sort orders
      const updates = newItems.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }))

      setSaving(true)
      try {
        const response = await fetch('/api/admin/buttons/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updates }),
        })
        if (!response.ok) throw new Error('Failed to save order')
        router.refresh()
      } catch (err) {
        console.error('Failed to save order:', err)
        // Revert on failure
        setItems(buttons)
      } finally {
        setSaving(false)
      }
    }
  }

  const allSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredItems.length

  return (
    <div className="relative">
      {saving && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Category Filter Dropdowns - Cascading */}
      {(rootCategories.length > 0 || uncategorizedCount > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Render cascading dropdowns dynamically */}
          {dropdownLevels.map((level, index) => {
            const currentSelection = filterPath[index] || 'all'
            const isFirstLevel = index === 0

            return (
              <div key={level.parentId ?? 'root'} className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground/80">
                  {isFirstLevel ? 'Category:' : `${level.parentName}:`}
                </label>
                <select
                  value={currentSelection}
                  onChange={(e) => handleLevelChange(index, e.target.value)}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {isFirstLevel ? (
                    <>
                      <option value="all">All Categories ({items.length})</option>
                      {uncategorizedCount > 0 && (
                        <option value="uncategorized">Uncategorized ({uncategorizedCount})</option>
                      )}
                    </>
                  ) : (
                    <option value="all">All in {level.parentName}</option>
                  )}
                  {level.children.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )
          })}

          {/* Count display */}
          {filterPath.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Showing {filteredItems.length} of {items.length} buttons
            </span>
          )}
        </div>
      )}

      {/* Select All Header */}
      {filteredItems.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={allSelected ? clearSelection : selectAll}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              allSelected
                ? 'bg-primary border-primary text-primary-foreground'
                : someSelected
                ? 'bg-primary/50 border-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            }`}
          >
            {(allSelected || someSelected) && <Check className="w-3 h-3" />}
          </button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size > 0 ? `${selectedIds.size} of ${filteredItems.length} selected` : 'Select all'}
          </span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredItems.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((button) => (
              <SortableButtonCard
                key={button.id}
                button={button}
                categories={categories}
                isSelected={selectedIds.has(button.id)}
                onToggleSelect={() => toggleSelect(button.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <PaginationControls {...pagination} />
      )}

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedIds={Array.from(selectedIds)}
        onClearSelection={clearSelection}
        onActionComplete={() => router.refresh()}
        categories={categories}
      />
    </div>
  )
}

type SortableButtonCardProps = {
  button: PayloadButton
  categories: Category[]
  isSelected: boolean
  onToggleSelect: () => void
}

function SortableButtonCard({ button, categories, isSelected, onToggleSelect }: SortableButtonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: button.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const imageUrl = typeof button.image === 'object' ? button.image?.url : null
  const categoryName = typeof button.category === 'object' ? button.category?.name : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card rounded-xl shadow-sm border overflow-hidden ${
        !button.active ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-lg ring-2 ring-primary/50' : ''} ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {/* Selection Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect()
          }}
          className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background/80 border-muted-foreground/30 hover:border-muted-foreground/50'
          }`}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </button>

        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={button.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!button.active && (
          <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded">
            Hidden
          </div>
        )}
        {button.featured && (
          <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{button.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground truncate">
            {categoryName || 'No category'}
          </span>
          <span className="text-sm font-medium text-foreground">
            ${button.price.toFixed(2)}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <ButtonActions
            buttonId={button.id}
            isActive={button.active}
            isFeatured={button.featured ?? false}
            buttonName={button.name}
            buttonDescription={button.description}
            buttonPrice={button.price}
            buttonCategoryId={typeof button.category === 'object' ? button.category?.id : undefined}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}
