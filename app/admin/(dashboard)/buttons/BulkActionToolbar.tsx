'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Eye, EyeOff, Trash2, X, Loader2, FolderInput } from 'lucide-react'

type BulkAction = 'feature' | 'unfeature' | 'hide' | 'show' | 'delete' | 'move-category'

type Category = {
  id: string
  name: string
  parentId: string | null
}

type Props = {
  selectedIds: string[]
  onClearSelection: () => void
  onActionComplete: () => void
  categories?: Category[]
}

export default function BulkActionToolbar({ selectedIds, onClearSelection, onActionComplete, categories = [] }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const count = selectedIds.length

  const performAction = async (action: BulkAction, categoryId?: string | null) => {
    if (action === 'delete' && !confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setLoading(true)
    try {
      const body: { ids: string[]; action: BulkAction; categoryId?: string | null } = { ids: selectedIds, action }
      if (action === 'move-category') {
        body.categoryId = categoryId ?? null
      }

      const response = await fetch('/api/admin/buttons/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
        'move-category': 'moved',
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
      setShowMoveModal(false)
      setSelectedCategory('')
    }
  }

  const handleMoveToCategory = () => {
    // selectedCategory can be '' (uncategorized) or a category id
    performAction('move-category', selectedCategory || null)
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
              onClick={() => setShowMoveModal(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium transition-colors disabled:opacity-50"
              title="Move to category"
            >
              <FolderInput className="w-4 h-4" />
              Move
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

      {/* Move to Category Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FolderInput className="h-5 w-5 text-blue-600" />
                Move {count} Button{count !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setShowMoveModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Destination Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parentId ? '  └ ' : ''}{cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select &quot;Uncategorized&quot; to remove category assignment
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToCategory}
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderInput className="h-4 w-4" />}
                {loading ? 'Moving...' : 'Move Buttons'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
