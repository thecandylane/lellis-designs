import { getPayload } from '@/lib/payload'
import CategoryList from './CategoryList'
import AddCategoryForm from './AddCategoryForm'
import SearchBar from '@/components/admin/SearchBar'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string }>

type PayloadCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  parent?: { id: string; name: string } | string | null
  colorPrimary?: string | null
  colorSecondary?: string | null
  active: boolean
  sortOrder: number
}

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const searchQuery = params.q || ''
  const payload = await getPayload()

  // Build where clause for search
  let whereClause: Where | undefined
  if (searchQuery) {
    whereClause = { name: { contains: searchQuery } }
  }

  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: whereClause,
    sort: 'sortOrder',
    limit: 200,
    depth: 1,
  })

  // Count buttons per category
  const categoryCounts = new Map<string, number>()
  for (const cat of categories) {
    const catId = String(cat.id)
    const { totalDocs } = await payload.count({
      collection: 'buttons',
      where: { category: { equals: catId } },
    })
    categoryCounts.set(catId, totalDocs)
  }

  // Build tree structure
  const categoryTree = buildTree(categories as PayloadCategory[], categoryCounts)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Organize your buttons into categories</p>
        </div>
        <div className="w-full sm:w-64">
          <SearchBar placeholder="Search categories..." />
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="font-medium text-gray-900 mb-4">Add New Category</h2>
        <AddCategoryForm categories={categories as PayloadCategory[]} />
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Your Categories</h2>
        </div>
        {categoryTree.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No categories yet. Add one above!
          </div>
        ) : (
          <CategoryList categories={categoryTree} />
        )}
      </div>
    </div>
  )
}

type CategoryNode = {
  id: string
  name: string
  slug: string
  description?: string | null
  active: boolean
  buttonCount: number
  sortOrder: number
  children: CategoryNode[]
}

function buildTree(
  categories: PayloadCategory[],
  counts: Map<string, number>
): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  // Create nodes
  for (const cat of categories) {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      active: cat.active,
      buttonCount: counts.get(cat.id) || 0,
      sortOrder: cat.sortOrder,
      children: [],
    })
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
