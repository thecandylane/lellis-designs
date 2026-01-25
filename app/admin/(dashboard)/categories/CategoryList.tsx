'use client'

import { useState, useCallback } from 'react'
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
import { ChevronRight, Trash2, Eye, EyeOff, Loader2, GripVertical, Edit2, X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

type CategoryNode = {
  id: string
  name: string
  slug: string
  description?: string | null
  active: boolean
  buttonCount: number
  sortOrder: number
  iconUrl?: string | null
  colorPrimary?: string | null
  colorSecondary?: string | null
  children: CategoryNode[]
}

// Helper to update children of a specific parent in the tree
function updateChildrenInTree(
  items: CategoryNode[],
  parentId: string | null,
  newChildren: CategoryNode[]
): CategoryNode[] {
  if (parentId === null) {
    return newChildren
  }

  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: newChildren }
    }
    if (item.children.length > 0) {
      return { ...item, children: updateChildrenInTree(item.children, parentId, newChildren) }
    }
    return item
  })
}

// Helper to find children of a specific parent
function findChildren(items: CategoryNode[], parentId: string | null): CategoryNode[] {
  if (parentId === null) {
    return items
  }

  for (const item of items) {
    if (item.id === parentId) {
      return item.children
    }
    if (item.children.length > 0) {
      const found = findChildren(item.children, parentId)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
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

  const handleReorder = useCallback(async (
    parentId: string | null,
    activeId: string,
    overId: string
  ) => {
    const siblings = findChildren(items, parentId)
    const oldIndex = siblings.findIndex((item) => item.id === activeId)
    const newIndex = siblings.findIndex((item) => item.id === overId)

    if (oldIndex === -1 || newIndex === -1) return

    const newSiblings = arrayMove(siblings, oldIndex, newIndex)
    const newItems = updateChildrenInTree(items, parentId, newSiblings)
    setItems(newItems)

    // Calculate new sort orders for siblings only
    const updates = newSiblings.map((item, index) => ({
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
  }, [items, categories, router])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Get parent info from sortable data
      const activeParentId = (active.data.current?.parentId as string | null) ?? null
      const overParentId = (over.data.current?.parentId as string | null) ?? null

      // Only allow reordering within the same parent
      if (activeParentId === overParentId) {
        await handleReorder(activeParentId, active.id as string, over.id as string)
      }
    }
  }, [handleReorder])

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
            <SortableCategoryRow
              key={category.id}
              category={category}
              depth={0}
              parentId={null}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableCategoryRow({
  category,
  depth,
  parentId,
}: {
  category: CategoryNode
  depth: number
  parentId: string | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: { parentId },
  })

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
        parentId={parentId}
        dragHandleProps={{ ...attributes, ...listeners }}
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
  parentId,
  dragHandleProps,
  isDragging,
}: {
  category: CategoryNode
  depth: number
  parentId: string | null
  dragHandleProps?: DragHandleProps
  isDragging?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editDescription, setEditDescription] = useState(category.description || '')
  const [editColorPrimary, setEditColorPrimary] = useState(category.colorPrimary || '')
  const [editColorSecondary, setEditColorSecondary] = useState(category.colorSecondary || '')
  const [previewIcon, setPreviewIcon] = useState<string | null>(category.iconUrl || null)

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

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setPreviewIcon(data.url)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null,
          colorPrimary: editColorPrimary || null,
          colorSecondary: editColorSecondary || null,
          iconUrl: previewIcon,
        }),
      })
      if (!response.ok) throw new Error('Failed')
      router.refresh()
      setShowEdit(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = () => {
    setEditName(category.name)
    setEditDescription(category.description || '')
    setEditColorPrimary(category.colorPrimary || '')
    setEditColorSecondary(category.colorSecondary || '')
    setPreviewIcon(category.iconUrl || null)
    setShowEdit(true)
  }

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 ${
          !category.active ? 'opacity-60' : ''
        } ${isDragging ? 'bg-teal-50 shadow-lg rounded-lg' : ''}`}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        {/* Top row: Drag Handle + Expand + Icon Preview + Name + Count */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {/* Drag Handle */}
          {dragHandleProps ? (
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

          {/* Icon Preview */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {category.iconUrl ? (
              <Image
                src={category.iconUrl}
                alt={category.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: category.colorPrimary && category.colorSecondary
                    ? `linear-gradient(135deg, ${category.colorPrimary} 0%, ${category.colorSecondary} 100%)`
                    : 'linear-gradient(135deg, #461D7C 0%, #FDD023 100%)',
                }}
              />
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0 ml-2">
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
              onClick={openEditModal}
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Edit category"
            >
              <Edit2 className="w-4 h-4" />
            </button>
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

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Edit Category
              </h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Icon (displayed as circular button)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200 flex-shrink-0">
                    {previewIcon ? (
                      <Image
                        src={previewIcon}
                        alt="Icon preview"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: editColorPrimary && editColorSecondary
                            ? `linear-gradient(135deg, ${editColorPrimary} 0%, ${editColorSecondary} 100%)`
                            : 'linear-gradient(135deg, #461D7C 0%, #FDD023 100%)',
                        }}
                      >
                        <ImageIcon className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 400x400px square image</p>
                    {previewIcon && (
                      <button
                        onClick={() => setPreviewIcon(null)}
                        className="text-xs text-red-600 hover:text-red-700 mt-1"
                      >
                        Remove icon
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editColorPrimary || '#461D7C'}
                      onChange={(e) => setEditColorPrimary(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editColorPrimary}
                      onChange={(e) => setEditColorPrimary(e.target.value)}
                      placeholder="#461D7C"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editColorSecondary || '#FDD023'}
                      onChange={(e) => setEditColorSecondary(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editColorSecondary}
                      onChange={(e) => setEditColorSecondary(e.target.value)}
                      placeholder="#FDD023"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading || !editName.trim()}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children - sortable within their parent */}
      {expanded && category.children.length > 0 && (
        <SortableContext
          items={category.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {category.children.map((child) => (
            <SortableCategoryRow
              key={child.id}
              category={child}
              depth={depth + 1}
              parentId={category.id}
            />
          ))}
        </SortableContext>
      )}
    </>
  )
}
