import { getPayload } from '@/lib/payload'
import Image from 'next/image'
import Link from 'next/link'
import ButtonActions from './ButtonActions'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ category?: string }>

type PayloadButton = {
  id: string
  name: string
  description?: string | null
  image?: { url?: string } | string | null
  category?: { id: string; name: string } | string | null
  price: number
  active: boolean
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
  const payload = await getPayload()

  // Fetch categories for filter
  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: { active: { equals: true } },
    sort: 'name',
    limit: 100,
  })

  // Fetch buttons
  const whereClause = categoryFilter !== 'all'
    ? { category: { equals: categoryFilter } }
    : undefined

  const { docs: buttons, totalDocs } = await payload.find({
    collection: 'buttons',
    where: whereClause,
    sort: '-createdAt',
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
        <Link
          href="/admin/upload"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors min-h-[44px]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Buttons
        </Link>
      </div>

      {/* Category Filter */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <span className="text-sm font-medium text-foreground/80 whitespace-nowrap pt-1.5 sm:pt-0">Filter:</span>
          <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1 -mb-1">
            <Link
              href="/admin/buttons"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap min-h-[36px] flex items-center ${
                categoryFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </Link>
            {categoryTree.map((cat) => (
              <CategoryFilterLink
                key={cat.id}
                category={cat}
                currentFilter={categoryFilter}
                depth={0}
              />
            ))}
          </div>
        </div>
      </div>

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {buttons.map((button) => (
            <ButtonCard key={button.id} button={button as PayloadButton} />
          ))}
        </div>
      )}
    </div>
  )
}

function ButtonCard({ button }: { button: PayloadButton }) {
  const imageUrl = typeof button.image === 'object' ? button.image?.url : null
  const categoryName = typeof button.category === 'object' ? button.category?.name : null

  return (
    <div className={`bg-card rounded-xl shadow-sm border border-border overflow-hidden ${!button.active ? 'opacity-60' : ''}`}>
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={button.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!button.active && (
          <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded">
            Hidden
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground truncate">{button.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground truncate">
            {categoryName || 'No category'}
          </span>
          <span className="text-sm font-medium text-foreground">
            ${button.price.toFixed(2)}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <ButtonActions
            buttonId={button.id}
            isActive={button.active}
            buttonName={button.name}
          />
        </div>
      </div>
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

function CategoryFilterLink({
  category,
  currentFilter,
  depth,
  parentName,
}: {
  category: CategoryNode
  currentFilter: string
  depth: number
  parentName?: string
}) {
  const isActive = currentFilter === category.id

  // For depth >= 2, show "Parent > Category" to distinguish nested categories
  const displayName = depth >= 2 && parentName
    ? `${parentName} > ${category.name}`
    : category.name

  return (
    <>
      <Link
        href={`/admin/buttons?category=${category.id}`}
        className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap min-h-[36px] flex items-center ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        {depth > 0 && '↳ '}
        {displayName}
      </Link>
      {category.children.map((child) => (
        <CategoryFilterLink
          key={child.id}
          category={child}
          currentFilter={currentFilter}
          depth={depth + 1}
          parentName={category.name}
        />
      ))}
    </>
  )
}
