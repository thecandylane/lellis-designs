import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Fetch all categories
    const categories = await payload.find({
      collection: 'categories',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 1000,
    })

    // Build tree structure
    type CategoryNode = {
      id: string
      name: string
      slug: string
      parent: string | null
      children: CategoryNode[]
    }

    const categoryMap = new Map<string, CategoryNode>()
    const rootCategories: CategoryNode[] = []

    // First pass: create all nodes
    for (const cat of categories.docs) {
      const catId = String(cat.id)
      const parentId = typeof cat.parent === 'object' ? String(cat.parent?.id) : cat.parent ? String(cat.parent) : null
      categoryMap.set(catId, {
        id: catId,
        name: cat.name,
        slug: cat.slug,
        parent: parentId,
        children: [],
      })
    }

    // Second pass: build tree
    for (const cat of categoryMap.values()) {
      if (cat.parent) {
        const parentNode = categoryMap.get(cat.parent)
        if (parentNode) {
          parentNode.children.push(cat)
        } else {
          rootCategories.push(cat)
        }
      } else {
        rootCategories.push(cat)
      }
    }

    return NextResponse.json({ docs: rootCategories })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
