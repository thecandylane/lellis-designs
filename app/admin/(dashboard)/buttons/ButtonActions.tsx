'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Trash2, Loader2, Edit2, X, Save } from 'lucide-react'

type Category = {
  id: string
  name: string
}

type ButtonActionsProps = {
  buttonId: string
  isActive: boolean
  buttonName: string
  buttonDescription?: string | null
  buttonPrice?: number
  buttonCategoryId?: string | null
  categories?: Category[]
}

export default function ButtonActions({
  buttonId,
  isActive,
  buttonName,
  buttonDescription,
  buttonPrice = 5,
  buttonCategoryId,
  categories = [],
}: ButtonActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editData, setEditData] = useState({
    name: buttonName,
    description: buttonDescription || '',
    price: buttonPrice,
    category: buttonCategoryId || '',
  })

  const toggleActive = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/buttons/${buttonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isActive }),
      })

      if (!response.ok) throw new Error('Failed to update')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteButton = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/buttons/${buttonId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setShowDelete(false)
    }
  }

  const saveEdit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/buttons/${buttonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description || null,
          price: editData.price,
          category: editData.category ? Number(editData.category) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update')
      setShowEdit(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (showDelete) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Delete &ldquo;{buttonName}&rdquo;?</p>
        <div className="flex gap-2">
          <button
            onClick={deleteButton}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-1.5 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm transition-colors ${
            isActive
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
          }`}
          title={isActive ? 'Hide from site' : 'Show on site'}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isActive ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show
            </>
          )}
        </button>
        <button
          onClick={() => setShowEdit(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit button"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Edit Button
              </h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={loading || !editData.name}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
