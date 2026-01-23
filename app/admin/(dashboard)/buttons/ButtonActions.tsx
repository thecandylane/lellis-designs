'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'

type ButtonActionsProps = {
  buttonId: string
  isActive: boolean
  buttonName: string
}

export default function ButtonActions({ buttonId, isActive, buttonName }: ButtonActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

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
        onClick={() => setShowDelete(true)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Delete button"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
