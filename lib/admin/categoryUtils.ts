import type { Payload } from 'payload'

type CategoryWithParent = {
  id: string
  parent?: { id: string } | string | null
}

/**
 * Get all descendant category IDs for a given category (including itself)
 */
export function getDescendantCategoryIds(
  categoryId: string,
  categories: CategoryWithParent[]
): string[] {
  const descendants: string[] = [categoryId]

  const findChildren = (parentId: string) => {
    for (const cat of categories) {
      const catParentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
      if (catParentId === parentId) {
        descendants.push(cat.id)
        findChildren(cat.id)
      }
    }
  }

  findChildren(categoryId)
  return descendants
}

/**
 * Build a parent-to-children map for efficient tree traversal
 */
function buildParentChildMap(categories: CategoryWithParent[]): Map<string | null, string[]> {
  const map = new Map<string | null, string[]>()

  for (const cat of categories) {
    const parentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
    const key = parentId ?? null
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(cat.id)
  }

  return map
}

/**
 * Recursively sum button counts for a category and all its descendants
 */
function sumDescendantCounts(
  categoryId: string,
  directCounts: Map<string, number>,
  parentChildMap: Map<string | null, string[]>,
  cache: Map<string, number>
): number {
  // Return cached result if available
  if (cache.has(categoryId)) {
    return cache.get(categoryId)!
  }

  // Start with direct count
  let total = directCounts.get(categoryId) || 0

  // Add counts from all children
  const children = parentChildMap.get(categoryId) || []
  for (const childId of children) {
    total += sumDescendantCounts(childId, directCounts, parentChildMap, cache)
  }

  cache.set(categoryId, total)
  return total
}

export type CategoryCounts = {
  direct: number
  total: number
}

/**
 * Batch count buttons by category in a single query
 * Returns both direct count (buttons in this category) and total count (including descendants)
 */
export async function batchCountButtonsByCategory(
  payload: Payload,
  categories: CategoryWithParent[]
): Promise<Map<string, CategoryCounts>> {
  const result = new Map<string, CategoryCounts>()

  if (categories.length === 0) {
    return result
  }

  // Get all category IDs
  const categoryIds = categories.map(c => c.id)

  // Fetch all buttons with their category IDs in a single query
  const { docs: buttons } = await payload.find({
    collection: 'buttons',
    where: {
      category: { in: categoryIds }
    },
    limit: 10000, // Get all buttons
    depth: 0, // Don't need to populate relations
  })

  // Count buttons per category (direct counts)
  const directCounts = new Map<string, number>()
  for (const button of buttons) {
    const catId = typeof button.category === 'object'
      ? (button.category as { id: string })?.id
      : button.category
    if (catId) {
      const catIdStr = String(catId)
      directCounts.set(catIdStr, (directCounts.get(catIdStr) || 0) + 1)
    }
  }

  // Build parent-child map for efficient traversal
  const parentChildMap = buildParentChildMap(categories)

  // Calculate total counts (including descendants) with caching
  const totalCountCache = new Map<string, number>()

  for (const cat of categories) {
    const catId = cat.id
    const direct = directCounts.get(catId) || 0
    const total = sumDescendantCounts(catId, directCounts, parentChildMap, totalCountCache)

    result.set(catId, { direct, total })
  }

  return result
}
