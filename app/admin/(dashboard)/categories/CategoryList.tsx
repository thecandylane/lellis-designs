'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, Trash2, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react'

type CategoryNode = {
  id: string
  name: string
  slug: string
  description?: string | null
  active: boolean
  buttonCount: number
  sortOrder: number
  children: CategoryNode[]
}

export default function CategoryList({ categories }: { categories: CategoryNode[] }) {
  const router = useRouter()
  const [items, setItems] = useState(categories)
  const [saving, setSaving] = useState(false)

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
        const response = await fetch('/api/admin/categories/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updates }),
        })
        if (!response.ok) throw new Error('Failed to save order')
        router.refresh()
      } catch (err) {
        console.error('Failed to save order:', err)
        // Revert on failure
        setItems(categories)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <div className="divide-y divide-gray-100 relative">
      {saving && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((category) => (
            <SortableCategoryRow key={category.id} category={category} depth={0} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableCategoryRow({ category, depth }: { category: CategoryNode; depth: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: depth > 0 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? 'relative' as const : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <CategoryRow
        category={category}
        depth={depth}
        dragHandleProps={depth === 0 ? { ...attributes, ...listeners } : undefined}
        isDragging={isDragging}
      />
    </div>
  )
}

type DragHandleProps = {
  [key: string]: unknown
}

function CategoryRow({
  category,
  depth,
  dragHandleProps,
  isDragging,
}: {
  category: CategoryNode
  depth: number
  dragHandleProps?: DragHandleProps
  isDragging?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  const hasChildren = category.children.length > 0

  const toggleActive = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !category.active }),
      })
      if (!response.ok) throw new Error('Failed')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setShowDelete(false)
    }
  }

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 ${
          !category.active ? 'opacity-60' : ''
        } ${isDragging ? 'bg-teal-50 shadow-lg rounded-lg' : ''}`}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        {/* Top row: Drag Handle + Expand + Name + Count */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {/* Drag Handle - only for top-level */}
          {depth === 0 && dragHandleProps ? (
            <button
              {...dragHandleProps}
              className="p-2 -ml-2 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center touch-none"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-[44px]" />
          )}

          {/* Expand/Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
              hasChildren ? 'hover:bg-gray-200 text-gray-400' : 'invisible'
            }`}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          </button>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{category.name}</p>
            {category.description && (
              <p className="text-sm text-gray-500 truncate">{category.description}</p>
            )}
          </div>

          {/* Button Count */}
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {category.buttonCount} button{category.buttonCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Actions row */}
        {showDelete ? (
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <span className="text-sm text-gray-600">Delete?</span>
            <button
              onClick={deleteCategory}
              disabled={loading}
              className="text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Deleting...' : 'Yes'}
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-2 min-h-[44px]"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 ml-auto sm:ml-0">
            <button
              onClick={toggleActive}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                category.active
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  : 'text-teal-600 hover:bg-teal-50'
              }`}
              title={category.active ? 'Hide category' : 'Show category'}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : category.active ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Children - not sortable at nested levels for now */}
      {expanded &&
        category.children.map((child) => (
          <CategoryRow key={child.id} category={child} depth={depth + 1} />
        ))}
    </>
  )
}
