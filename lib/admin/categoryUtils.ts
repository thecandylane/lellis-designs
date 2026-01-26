import type { Payload } from 'payload'

type CategoryWithParent = {
  id: string
  parent?: { id: string } | string | null
}

/**
 * Get all descendant category IDs for a given category (including itself)
 * Note: All IDs are normalized to strings to handle PostgreSQL integer IDs
 */
export function getDescendantCategoryIds(
  categoryId: string,
  categories: CategoryWithParent[]
): string[] {
  const normalizedCategoryId = String(categoryId)
  const descendants: string[] = [normalizedCategoryId]

  const findChildren = (parentId: string) => {
    for (const cat of categories) {
      const catParentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
      // Normalize both sides for comparison
      if (catParentId != null && String(catParentId) === parentId) {
        const childId = String(cat.id)
        descendants.push(childId)
        findChildren(childId)
      }
    }
  }

  findChildren(normalizedCategoryId)
  return descendants
}

/**
 * Build a parent-to-children map for efficient tree traversal
 * Note: All IDs are normalized to strings to handle PostgreSQL integer IDs
 */
function buildParentChildMap(categories: CategoryWithParent[]): Map<string | null, string[]> {
  const map = new Map<string | null, string[]>()

  for (const cat of categories) {
    const parentId = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
    // Normalize key to string (or null for root categories)
    const key = parentId ? String(parentId) : null
    if (!map.has(key)) {
      map.set(key, [])
    }
    // Normalize child ID to string
    map.get(key)!.push(String(cat.id))
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

  // Get category IDs as numbers for Postgres query
  const categoryIdsForQuery = categories.map(c =>
    typeof c.id === 'number' ? c.id : parseInt(String(c.id), 10)
  )

  // Fetch all buttons with their category IDs in a single query
  const { docs: buttons } = await payload.find({
    collection: 'buttons',
    where: {
      category: { in: categoryIdsForQuery }
    },
    limit: 10000, // Get all buttons
    depth: 0, // Don't need to populate relations
  })

  // Count buttons per category (direct counts)
  // At depth: 0, category is returned as an ID directly (may be number from PostgreSQL)
  const directCounts = new Map<string, number>()
  for (const button of buttons) {
    const cat = button.category
    // Handle both ID (depth: 0) and object (depth: 1+) cases, always normalize to string
    const catId = cat
      ? typeof cat === 'object' && cat !== null
        ? String((cat as { id: string }).id)
        : String(cat)
      : null
    if (catId) {
      directCounts.set(catId, (directCounts.get(catId) || 0) + 1)
    }
  }

  // Build parent-child map for efficient traversal
  const parentChildMap = buildParentChildMap(categories)

  // Calculate total counts (including descendants) with caching
  const totalCountCache = new Map<string, number>()

  for (const cat of categories) {
    // Normalize ID to string for consistent Map key matching
    const catId = String(cat.id)
    const direct = directCounts.get(catId) || 0
    const total = sumDescendantCounts(catId, directCounts, parentChildMap, totalCountCache)

    result.set(catId, { direct, total })
  }

  return result
}
