import { getPayload } from '@/lib/payload'
import Link from 'next/link'
import SortableButtonGrid from './SortableButtonGrid'
import AddButtonForm from './AddButtonForm'
import SearchBar from '@/components/admin/SearchBar'
import CategoryFilter from './CategoryFilter'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ category?: string; q?: string }>

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

type PayloadCategory = {
  id: string
  name: string
  parent?: { id: string } | string | null
}

export default async function ButtonsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const categoryFilter = params.category || 'all'
  const searchQuery = params.q || ''
  const payload = await getPayload()

  // Fetch categories for filter
  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: { active: { equals: true } },
    sort: 'name',
    limit: 100,
  })

  // Build where clause for buttons
  const conditions: Where[] = []

  if (categoryFilter !== 'all') {
    conditions.push({ category: { equals: categoryFilter } })
  }

  if (searchQuery) {
    conditions.push({ name: { contains: searchQuery } })
  }

  const whereClause: Where | undefined = conditions.length > 0
    ? conditions.length === 1
      ? conditions[0]
      : { and: conditions }
    : undefined

  const { docs: buttons, totalDocs } = await payload.find({
    collection: 'buttons',
    where: whereClause,
    sort: 'sortOrder',
    limit: 200,
    depth: 1, // Include category relation
  })

  // Build category tree for dropdown
  const categoryTree = buildCategoryTree(categories as PayloadCategory[])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Buttons</h1>
          <p className="text-muted-foreground">{totalDocs} button{totalDocs !== 1 ? 's' : ''} listed</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-48">
            <SearchBar placeholder="Search buttons..." />
          </div>
          <AddButtonForm categories={categories as PayloadCategory[]} />
          <Link
            href="/admin/upload"
            className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Upload
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter categories={categoryTree.map(c => ({ id: c.id, name: c.name }))} />

      {/* Buttons Grid */}
      {buttons.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No buttons yet</h3>
          <p className="text-muted-foreground mb-4">Upload your first button designs to get started!</p>
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Buttons
          </Link>
        </div>
      ) : (
        <SortableButtonGrid
          buttons={buttons as PayloadButton[]}
          categories={(categories as PayloadCategory[]).map(c => ({ id: c.id, name: c.name }))}
        />
      )}
    </div>
  )
}

type CategoryNode = {
  id: string
  name: string
  children: CategoryNode[]
}

function buildCategoryTree(categories: PayloadCategory[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  // Create nodes
  for (const cat of categories) {
    map.set(cat.id, { id: cat.id, name: cat.name, children: [] })
  }

  // Build tree
  for (const cat of categories) {
    const node = map.get(cat.id)!
    const parentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

