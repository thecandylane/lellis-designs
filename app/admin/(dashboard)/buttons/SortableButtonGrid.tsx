'use client'

import { useState } from 'react'
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
import { Loader2, GripVertical } from 'lucide-react'
import ButtonActions from './ButtonActions'

type PayloadButton = {
  id: string
  name: string
  description?: string | null
  image?: { url?: string } | string | null
  category?: { id: string; name: string } | string | null
  price: number
  active: boolean
  sortOrder: number
  createdAt: string
}

export default function SortableButtonGrid({ buttons }: { buttons: PayloadButton[] }) {
  const router = useRouter()
  const [items, setItems] = useState(buttons)
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

  return (
    <div className="relative">
      {saving && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((button) => (
              <SortableButtonCard key={button.id} button={button} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableButtonCard({ button }: { button: PayloadButton }) {
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
      className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden ${
        !button.active ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-lg ring-2 ring-primary/50' : ''}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
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
            buttonName={button.name}
          />
        </div>
      </div>
    </div>
  )
}
