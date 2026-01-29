import { Suspense } from 'react'
import { getPayload } from '@/lib/payload'
import Link from 'next/link'
import SortableButtonGrid from './SortableButtonGrid'
import AddButtonForm from './AddButtonForm'
import SearchBar from '@/components/admin/SearchBar'
import FilterTabs from '@/components/admin/FilterTabs'
import CategoryFilter from '@/components/admin/CategoryFilter'
import { getDescendantCategoryIds, batchCountButtonsByCategory } from '@/lib/admin/categoryUtils'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 24

type SearchParams = Promise<{
  category?: string
  q?: string
  status?: string
  page?: string
  limit?: string
}>

type PayloadButton = {
  id: string
  name: string
  description?: string | null
  image?: { url?: string } | string | null
  category?: { id: string; name: string } | string | null
  price?: number | null
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
  const searchQuery = params.q || ''
  const statusFilter = params.status || 'active'
  const categoryFilter = params.category || ''
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const limit = Math.min(100, Math.max(12, parseInt(params.limit || String(DEFAULT_LIMIT), 10)))
  const payload = await getPayload()

  // Fetch all categories (including inactive) for filtering
  const { docs: allCategories } = await payload.find({
    collection: 'categories',
    sort: 'name',
    limit: 200,
  })

  // Build compound where clause
  const whereConditions: Where[] = []

  // Search across multiple fields
  if (searchQuery) {
    whereConditions.push({
      or: [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { sku: { contains: searchQuery } },
      ]
    })
  }

  // Status filter
  switch (statusFilter) {
    case 'active':
      whereConditions.push({ active: { equals: true } })
      break
    case 'hidden':
      whereConditions.push({ active: { equals: false } })
      break
    case 'featured':
      whereConditions.push({ featured: { equals: true } })
      break
    case 'uncategorized':
      whereConditions.push({
        or: [
          { category: { exists: false } },
          { category: { equals: null } },
        ]
      })
      break
  }

  // Category filter (server-side with descendants)
  if (categoryFilter) {
    const descendantIds = getDescendantCategoryIds(categoryFilter, allCategories as PayloadCategory[])
    // Convert to numbers for Postgres query
    const descendantIdsForQuery = descendantIds.map(id => parseInt(id, 10))
    whereConditions.push({ category: { in: descendantIdsForQuery } })
  }

  // Combine conditions
  const whereClause: Where | undefined = whereConditions.length > 0
    ? whereConditions.length === 1
      ? whereConditions[0]
      : { and: whereConditions }
    : undefined

  // Fetch buttons with pagination
  const {
    docs: buttons,
    totalDocs,
    totalPages,
    hasNextPage,
    hasPrevPage,
    page,
  } = await payload.find({
    collection: 'buttons',
    where: whereClause,
    sort: 'sortOrder',
    limit,
    page: currentPage,
    depth: 1,
  })

  // Get counts for filter tabs
  const [activeCount, hiddenCount, featuredCount, uncategorizedCount] = await Promise.all([
    payload.count({ collection: 'buttons', where: { active: { equals: true } } }),
    payload.count({ collection: 'buttons', where: { active: { equals: false } } }),
    payload.count({ collection: 'buttons', where: { featured: { equals: true } } }),
    payload.count({
      collection: 'buttons',
      where: { or: [{ category: { exists: false } }, { category: { equals: null } }] }
    }),
  ])

  // Get total buttons count for category filter
  const { totalDocs: allButtonsCount } = await payload.count({ collection: 'buttons' })

  // Active categories for the dropdown
  const activeCategories = allCategories.filter(c => c.active)

  // Fetch button counts per category for the filter dropdown
  const categoryCounts = await batchCountButtonsByCategory(payload, activeCategories as PayloadCategory[])

  const filterOptions = [
    { value: 'active', label: 'Active', count: activeCount.totalDocs },
    { value: 'hidden', label: 'Hidden', count: hiddenCount.totalDocs },
    { value: 'featured', label: 'Featured', count: featuredCount.totalDocs },
    { value: 'uncategorized', label: 'Uncategorized', count: uncategorizedCount.totalDocs },
  ]

  // Pagination info
  const paginationProps = {
    currentPage: page || currentPage,
    totalPages: totalPages || 1,
    totalDocs,
    limit,
    hasNextPage: hasNextPage || false,
    hasPrevPage: hasPrevPage || false,
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Buttons</h1>
          <p className="text-muted-foreground">{totalDocs} button{totalDocs !== 1 ? 's' : ''} listed</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-48">
            <SearchBar placeholder="Search name, desc, SKU..." />
          </div>
          <AddButtonForm categories={activeCategories as PayloadCategory[]} />
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

      {/* Filter Tabs */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10" />}>
          <FilterTabs options={filterOptions} defaultValue="active" />
        </Suspense>
      </div>

      {/* Category Filter */}
      <Suspense fallback={<div className="h-10" />}>
        <CategoryFilter
          categories={(activeCategories as PayloadCategory[]).map(c => {
            const counts = categoryCounts.get(String(c.id)) || { direct: 0, total: 0 }
            return {
              id: String(c.id),
              name: c.name,
              parentId: typeof c.parent === 'object' ? (c.parent?.id ? String(c.parent.id) : null) : (c.parent ? String(c.parent) : null),
              buttonCount: counts.direct,
              totalButtonCount: counts.total,
            }
          })}
          totalButtons={allButtonsCount}
          uncategorizedCount={uncategorizedCount.totalDocs}
        />
      </Suspense>

      {/* Buttons Grid */}
      {buttons.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery || categoryFilter ? 'No matching buttons' : 'No buttons found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter
              ? 'Try adjusting your filters or search terms.'
              : statusFilter === 'active'
                ? 'No active buttons yet. Upload your first button designs to get started!'
                : `No ${statusFilter} buttons found.`}
          </p>
          {!searchQuery && !categoryFilter && statusFilter === 'active' && (
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Buttons
            </Link>
          )}
        </div>
      ) : (
        <SortableButtonGrid
          buttons={buttons as PayloadButton[]}
          categories={(activeCategories as PayloadCategory[]).map(c => {
            const counts = categoryCounts.get(String(c.id)) || { direct: 0, total: 0 }
            return {
              id: c.id,
              name: c.name,
              parentId: typeof c.parent === 'object' ? (c.parent?.id ?? null) : (c.parent ?? null),
              buttonCount: counts.direct,
              totalButtonCount: counts.total,
            }
          })}
          pagination={paginationProps}
        />
      )}
    </div>
  )
}

