import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { computeCategoryColors } from '@/lib/color-aggregation'

/**
 * One-time utility to backfill missing category colors
 * POST /api/admin/categories/backfill-colors
 *
 * This extracts colors from button images and saves them to categories
 * that don't have colors set. Run once, then colors are stored permanently.
 */
export async function POST() {
  try {
    const payload = await getPayload()

    // Get all categories without colors
    const { docs: categories } = await payload.find({
      collection: 'categories',
      where: {
        or: [
          { colorPrimary: { exists: false } },
          { colorSecondary: { exists: false } },
          { colorPrimary: { equals: null } },
          { colorSecondary: { equals: null } },
          { colorPrimary: { equals: '' } },
          { colorSecondary: { equals: '' } },
        ],
      },
      limit: 500,
    })

    const results: { id: string; name: string; status: string; colors?: { primary: string; secondary: string } }[] = []

    for (const category of categories) {
      // Skip if already has both colors
      if (category.colorPrimary && category.colorSecondary) {
        results.push({ id: String(category.id), name: String(category.name), status: 'skipped - has colors' })
        continue
      }

      // Compute colors from button images
      const colors = await computeCategoryColors(String(category.id))

      if (colors) {
        // Save to database
        await payload.update({
          collection: 'categories',
          id: category.id,
          data: {
            colorPrimary: colors.primary,
            colorSecondary: colors.secondary,
          },
        })
        results.push({
          id: String(category.id),
          name: String(category.name),
          status: 'updated',
          colors
        })
      } else {
        results.push({ id: String(category.id), name: String(category.name), status: 'no button images found' })
      }
    }

    const updated = results.filter(r => r.status === 'updated').length
    const skipped = results.filter(r => r.status !== 'updated').length

    return NextResponse.json({
      success: true,
      summary: { total: categories.length, updated, skipped },
      results,
    })
  } catch (error) {
    console.error('Error backfilling category colors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to backfill colors' },
      { status: 500 }
    )
  }
}
