'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Eye, EyeOff, Trash2, X, Loader2 } from 'lucide-react'

type BulkAction = 'feature' | 'unfeature' | 'hide' | 'show' | 'delete'

type Props = {
  selectedIds: string[]
  onClearSelection: () => void
  onActionComplete: () => void
}

export default function BulkActionToolbar({ selectedIds, onClearSelection, onActionComplete }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const count = selectedIds.length

  const performAction = async (action: BulkAction) => {
    if (action === 'delete' && !confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/buttons/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform action')
      }

      const actionLabels: Record<BulkAction, string> = {
        feature: 'featured',
        unfeature: 'unfeatured',
        hide: 'hidden',
        show: 'shown',
        delete: 'deleted',
      }

      toast.success(`${data.successCount} button${data.successCount !== 1 ? 's' : ''} ${actionLabels[action]}`)

      if (data.errorCount > 0) {
        toast.error(`${data.errorCount} button${data.errorCount !== 1 ? 's' : ''} failed`)
      }

      onClearSelection()
      onActionComplete()
      router.refresh()
    } catch (error) {
      console.error('Bulk action failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to perform action')
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  if (count === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-card border border-border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <span className="text-sm font-medium text-foreground">
            {count} selected
          </span>
          <button
            onClick={onClearSelection}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        {confirmDelete ? (
          <>
            <span className="text-sm text-red-600 font-medium">Delete {count} button{count !== 1 ? 's' : ''}?</span>
            <button
              onClick={() => performAction('delete')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => performAction('feature')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium transition-colors disabled:opacity-50"
              title="Feature selected"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              Feature
            </button>
            <button
              onClick={() => performAction('unfeature')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors disabled:opacity-50"
              title="Unfeature selected"
            >
              <Star className="w-4 h-4" />
              Unfeature
            </button>
            <button
              onClick={() => performAction('show')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-800 text-sm font-medium transition-colors disabled:opacity-50"
              title="Show selected"
            >
              <Eye className="w-4 h-4" />
              Show
            </button>
            <button
              onClick={() => performAction('hide')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors disabled:opacity-50"
              title="Hide selected"
            >
              <EyeOff className="w-4 h-4" />
              Hide
            </button>
            <button
              onClick={() => performAction('delete')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
              title="Delete selected"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
