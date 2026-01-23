'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

type CategoryNode = {
  id: string
  name: string
  slug: string
  description?: string | null
  active: boolean
  buttonCount: number
  children: CategoryNode[]
}

export default function CategoryList({ categories }: { categories: CategoryNode[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} depth={0} />
      ))}
    </div>
  )
}

function CategoryRow({ category, depth }: { category: CategoryNode; depth: number }) {
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
        className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 ${
          !category.active ? 'opacity-60' : ''
        }`}
        style={{ paddingLeft: `${20 + depth * 24}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-1 rounded transition-colors ${
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
        <span className="text-sm text-gray-500">
          {category.buttonCount} button{category.buttonCount !== 1 ? 's' : ''}
        </span>

        {/* Actions */}
        {showDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Delete?</span>
            <button
              onClick={deleteCategory}
              disabled={loading}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Yes'}
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={toggleActive}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
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
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {expanded &&
        category.children.map((child) => (
          <CategoryRow key={child.id} category={child} depth={depth + 1} />
        ))}
    </>
  )
}
