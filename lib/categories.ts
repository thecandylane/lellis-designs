import { getPayload } from '@/lib/payload'
import type { Category, CategoryWithChildren, CategoryWithAncestors, BreadcrumbItem } from '@/lib/types'

// Type for Payload category document
type PayloadCategory = {
  id: string | number
  name: string
  slug: string
  description?: string | null
  tags?: { tag: string }[] | null
  aliases?: { alias: string }[] | null
  parent?: { id: string | number } | string | number | null
  sortOrder?: number | null
  active?: boolean | null
  featured?: boolean | null
  colorPrimary?: string | null
  colorSecondary?: string | null
  backgroundImage?: { url?: string | null } | string | null
}

// Convert Payload category to our Category type
function toCategory(doc: PayloadCategory): Category {
  const parentId = typeof doc.parent === 'object'
    ? doc.parent?.id ? String(doc.parent.id) : null
    : doc.parent ? String(doc.parent) : null
  return {
    id: String(doc.id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || null,
    tags: doc.tags || null,
    aliases: doc.aliases || null,
    parent_id: parentId,
    sort_order: doc.sortOrder ?? 0,
    active: doc.active ?? true,
    featured: doc.featured ?? false,
    color_primary: doc.colorPrimary || null,
    color_secondary: doc.colorSecondary || null,
    background_image: typeof doc.backgroundImage === 'object'
      ? doc.backgroundImage?.url || null
      : null,
  }
}

/**
 * Fetch root categories (categories with no parent)
 */
export async function getRootCategories(): Promise<Category[]> {
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'categories',
    where: {
      parent: { exists: false },
      active: { equals: true },
    },
    sort: 'sortOrder',
    limit: 100,
  })

  return docs.map((doc) => toCategory(doc as unknown as PayloadCategory))
}

/**
 * Fetch direct child categories of a parent
 */
export async function getChildCategories(parentId: string): Promise<Category[]> {
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'categories',
    where: {
      parent: { equals: parentId },
      active: { equals: true },
    },
    sort: 'sortOrder',
    limit: 100,
  })

  return docs.map((doc) => toCategory(doc as unknown as PayloadCategory))
}

/**
 * Fetch a category by its ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const payload = await getPayload()

  try {
    const doc = await payload.findByID({
      collection: 'categories',
      id,
    })

    if (!doc || !(doc as PayloadCategory).active) return null
    return toCategory(doc as unknown as PayloadCategory)
  } catch {
    return null
  }
}

/**
 * Resolve a slug path to a category with its ancestors
 * e.g., ['baton-rouge', 'lsu', 'football'] -> category with full ancestor chain
 */
export async function getCategoryByPath(slugPath: string[]): Promise<CategoryWithAncestors | null> {
  if (slugPath.length === 0) return null

  const payload = await getPayload()
  const ancestors: Category[] = []
  let currentParentId: string | null = null

  for (let i = 0; i < slugPath.length; i++) {
    const slug = slugPath[i]

    const whereClause = currentParentId === null
      ? { slug: { equals: slug }, active: { equals: true }, parent: { exists: false } }
      : { slug: { equals: slug }, active: { equals: true }, parent: { equals: currentParentId } }

    const { docs } = await payload.find({
      collection: 'categories',
      where: whereClause,
      limit: 1,
    })

    if (docs.length === 0) return null

    const category = toCategory(docs[0] as unknown as PayloadCategory)

    if (i < slugPath.length - 1) {
      ancestors.push(category)
      currentParentId = category.id
    } else {
      return {
        ...category,
        ancestors
      }
    }
  }

  return null
}

/**
 * Get all categories as a tree structure (for admin)
 */
export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'categories',
    sort: 'sortOrder',
    limit: 1000,
  })

  const categories = docs.map((doc) => toCategory(doc as unknown as PayloadCategory))
  const categoryMap = new Map<string, CategoryWithChildren>()
  const roots: CategoryWithChildren[] = []

  // First pass: create map
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // Second pass: build tree
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!
    if (cat.parent_id === null) {
      roots.push(node)
    } else {
      const parent = categoryMap.get(cat.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        // Parent not found, treat as root
        roots.push(node)
      }
    }
  })

  return roots
}

/**
 * Get a flat list of categories with indentation info (for selects)
 */
export async function getCategoryOptions(): Promise<{ category: Category; depth: number }[]> {
  const tree = await getCategoryTree()
  const options: { category: Category; depth: number }[] = []

  function traverse(nodes: CategoryWithChildren[], depth: number) {
    for (const node of nodes) {
      options.push({ category: node, depth })
      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1)
      }
    }
  }

  traverse(tree, 0)
  return options
}

/**
 * Build breadcrumb items from a category with ancestors
 */
export function buildBreadcrumbs(category: CategoryWithAncestors): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', href: '/' }
  ]

  let path = '/category'
  for (const ancestor of category.ancestors) {
    path += `/${ancestor.slug}`
    items.push({ name: ancestor.name, href: path })
  }

  path += `/${category.slug}`
  items.push({ name: category.name, href: path })

  return items
}

/**
 * Get the full path of slugs for a category
 */
export function getCategoryPath(category: CategoryWithAncestors): string {
  const slugs = [...category.ancestors.map(a => a.slug), category.slug]
  return `/category/${slugs.join('/')}`
}

/**
 * Count buttons in a category
 */
export async function getButtonCount(categoryId: string): Promise<number> {
  const payload = await getPayload()

  const { totalDocs } = await payload.count({
    collection: 'buttons',
    where: {
      category: { equals: categoryId },
      active: { equals: true },
    },
  })

  return totalDocs
}

/**
 * Count subcategories of a category
 */
export async function getSubcategoryCount(categoryId: string): Promise<number> {
  const payload = await getPayload()

  const { totalDocs } = await payload.count({
    collection: 'categories',
    where: {
      parent: { equals: categoryId },
      active: { equals: true },
    },
  })

  return totalDocs
}
