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
  icon?: { url?: string | null } | string | null
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
    icon: typeof doc.icon === 'object'
      ? doc.icon?.url || null
      : null,
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
 * Get a random button image URL for a single category
 */
export async function getRandomButtonImageForCategory(categoryId: string): Promise<string | null> {
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'buttons',
    where: {
      category: { equals: categoryId },
      active: { equals: true },
    },
    limit: 10,
  })

  if (docs.length === 0) return null

  const picked = docs[Math.floor(Math.random() * docs.length)]
  const image = (picked as { image?: { url?: string | null } | string | null }).image
  if (typeof image === 'object' && image?.url) return image.url
  return null
}

/**
 * Get random button image URLs for multiple categories in a single batch query
 * Returns a Map of categoryId -> imageUrl (or null)
 */
export async function getRandomButtonImagesForCategories(
  categoryIds: string[]
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>()
  if (categoryIds.length === 0) return result

  const payload = await getPayload()

  // --- Pass 1: query buttons directly assigned to each category ---
  const { docs } = await payload.find({
    collection: 'buttons',
    where: {
      category: { in: categoryIds },
      active: { equals: true },
    },
    limit: 500,
  })

  // Group buttons by category
  const grouped = new Map<string, string[]>()
  for (const doc of docs) {
    const raw = doc as { category?: { id?: string | number } | string | number; image?: { url?: string | null } | string | null }
    const catId = typeof raw.category === 'object' && raw.category?.id
      ? String(raw.category.id)
      : raw.category ? String(raw.category) : null
    if (!catId) continue

    const imageUrl = typeof raw.image === 'object' && raw.image?.url ? raw.image.url : null
    if (!imageUrl) continue

    if (!grouped.has(catId)) grouped.set(catId, [])
    grouped.get(catId)!.push(imageUrl)
  }

  // Pick a random image from each category's direct buttons
  const missingIds: string[] = []
  for (const categoryId of categoryIds) {
    const images = grouped.get(categoryId)
    if (images && images.length > 0) {
      result.set(categoryId, images[Math.floor(Math.random() * images.length)])
    } else {
      missingIds.push(categoryId)
    }
  }

  // --- Pass 2: inherit images from descendant subcategories ---
  if (missingIds.length > 0) {
    // Fetch all active categories to build the parent→children map
    const { docs: allCatDocs } = await payload.find({
      collection: 'categories',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 1000,
    })

    const parentToChildren = new Map<string, string[]>()
    for (const doc of allCatDocs) {
      const cat = doc as unknown as PayloadCategory
      const parentId = typeof cat.parent === 'object'
        ? cat.parent?.id ? String(cat.parent.id) : null
        : cat.parent ? String(cat.parent) : null
      if (parentId) {
        if (!parentToChildren.has(parentId)) parentToChildren.set(parentId, [])
        parentToChildren.get(parentId)!.push(String(cat.id))
      }
    }

    // Recursively collect all descendant IDs for a category
    function getDescendantIds(catId: string): string[] {
      const children = parentToChildren.get(catId)
      if (!children) return []
      const descendants: string[] = [...children]
      for (const childId of children) {
        descendants.push(...getDescendantIds(childId))
      }
      return descendants
    }

    // Build a map of missing category → its descendant IDs
    const missingToDescendants = new Map<string, string[]>()
    const allDescendantIds = new Set<string>()
    for (const catId of missingIds) {
      const descendants = getDescendantIds(catId)
      missingToDescendants.set(catId, descendants)
      for (const d of descendants) allDescendantIds.add(d)
    }

    if (allDescendantIds.size > 0) {
      // Batch-query buttons for all descendant categories at once
      const { docs: descendantDocs } = await payload.find({
        collection: 'buttons',
        where: {
          category: { in: Array.from(allDescendantIds) },
          active: { equals: true },
        },
        limit: 500,
      })

      // Group descendant buttons by category
      const descendantGrouped = new Map<string, string[]>()
      for (const doc of descendantDocs) {
        const raw = doc as { category?: { id?: string | number } | string | number; image?: { url?: string | null } | string | null }
        const catId = typeof raw.category === 'object' && raw.category?.id
          ? String(raw.category.id)
          : raw.category ? String(raw.category) : null
        if (!catId) continue

        const imageUrl = typeof raw.image === 'object' && raw.image?.url ? raw.image.url : null
        if (!imageUrl) continue

        if (!descendantGrouped.has(catId)) descendantGrouped.set(catId, [])
        descendantGrouped.get(catId)!.push(imageUrl)
      }

      // For each missing category, pool images from all its descendants
      for (const catId of missingIds) {
        const descendants = missingToDescendants.get(catId) || []
        const pooledImages: string[] = []
        for (const descId of descendants) {
          const imgs = descendantGrouped.get(descId)
          if (imgs) pooledImages.push(...imgs)
        }
        if (pooledImages.length > 0) {
          result.set(catId, pooledImages[Math.floor(Math.random() * pooledImages.length)])
        } else {
          result.set(catId, null)
        }
      }
    } else {
      // No descendants found, set null for all missing
      for (const catId of missingIds) {
        result.set(catId, null)
      }
    }
  }

  return result
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
