'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'

type PayloadCategory = {
  id: string
  name: string
  parent?: { id: string; name: string } | string | null
}

export default function AddCategoryForm({ categories }: { categories: PayloadCategory[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          parent: parentId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create category')
      }

      setName('')
      setParentId('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  // Build flat list with depth for select
  const options = buildFlatList(categories)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      <div className="sm:w-48">
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">No parent (root)</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {'  '.repeat(opt.depth)}
              {opt.depth > 0 ? '└ ' : ''}
              {opt.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Add
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-2 sm:mt-0 sm:self-center">{error}</p>
      )}
    </form>
  )
}

type FlatOption = {
  id: string
  name: string
  depth: number
}

function buildFlatList(categories: PayloadCategory[]): FlatOption[] {
  const result: FlatOption[] = []
  const map = new Map<string, PayloadCategory>()
  const childrenMap = new Map<string, PayloadCategory[]>()

  // Build maps
  for (const cat of categories) {
    map.set(cat.id, cat)
    const parentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
    if (parentId) {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, [])
      }
      childrenMap.get(parentId)!.push(cat)
    }
  }

  // Find roots and traverse
  const roots = categories.filter((c) => {
    const parentId = typeof c.parent === 'object' ? c.parent?.id : c.parent
    return !parentId
  })

  const traverse = (cats: PayloadCategory[], depth: number) => {
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, depth })
      const children = childrenMap.get(cat.id) || []
      traverse(children, depth + 1)
    }
  }

  traverse(roots, 0)
  return result
}
