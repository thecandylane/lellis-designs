import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { getCategoryByPath, getChildCategories, buildBreadcrumbs, getSubcategoryCount, getButtonCount, getRandomButtonImagesForCategories } from '@/lib/categories'
import type { Button, CategoryWithAncestors } from '@/lib/types'
import CategoryBreadcrumb from '@/components/ui/CategoryBreadcrumb'
import CategoryGrid from '@/components/ui/CategoryGrid'
import CategoryContent from './CategoryContent'

// Enable ISR with 60-second revalidation for category pages
export const revalidate = 60

type Props = {
  params: Promise<{ slug: string[] }>
}

// Type for Payload button document
type PayloadButton = {
  id: string | number
  name: string
  description?: string | null
  image: { url?: string | null } | string
  category: { id: string | number } | string | number
  price?: number | null
  leadTimeDays?: number | null
  customization?: 'as_is' | 'customizable' | null
  active?: boolean | null
  tags?: { tag: string }[] | null
  featured?: boolean | null
  sku?: string | null
}

// Convert Payload button to our Button type
function toButton(doc: PayloadButton): Button {
  const categoryId = typeof doc.category === 'object'
    ? String(doc.category?.id)
    : doc.category ? String(doc.category) : null

  const imageObj = typeof doc.image === 'object' && doc.image ? doc.image as any : null

  return {
    id: String(doc.id),
    name: doc.name,
    description: doc.description || null,
    tags: doc.tags || null,
    image_url: imageObj?.url || '',
    image_thumbnail: imageObj?.sizes?.thumbnail?.url,
    image_card: imageObj?.sizes?.card?.url,
    category_id: categoryId,
    price: doc.price ?? null,
    lead_time_days: doc.leadTimeDays ?? 7,
    customization: doc.customization || 'as_is',
    active: doc.active ?? true,
    featured: doc.featured ?? false,
    sku: doc.sku || null,
  }
}

// Get effective colors (from category or nearest ancestor with colors)
function getEffectiveColors(category: CategoryWithAncestors): { primary: string; secondary: string } {
  // Default colors (teal/pink)
  const defaults = { primary: '#14B8A6', secondary: '#EC4899' }

  // Check current category first
  if (category.color_primary && category.color_secondary) {
    return { primary: category.color_primary, secondary: category.color_secondary }
  }

  // Check ancestors (most recent first - they're in order from root to parent)
  for (let i = category.ancestors.length - 1; i >= 0; i--) {
    const ancestor = category.ancestors[i]
    if (ancestor.color_primary && ancestor.color_secondary) {
      return { primary: ancestor.color_primary, secondary: ancestor.color_secondary }
    }
  }

  return defaults
}

// Get effective background image (from category or nearest ancestor)
function getEffectiveBackgroundImage(category: CategoryWithAncestors): string | null {
  // Check current category first
  if (category.background_image) {
    return category.background_image
  }

  // Check ancestors (most recent first)
  for (let i = category.ancestors.length - 1; i >= 0; i--) {
    const ancestor = category.ancestors[i]
    if (ancestor.background_image) {
      return ancestor.background_image
    }
  }

  return null
}

// Helper to determine if a color is light (for text contrast)
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  // Resolve the slug path to a category with ancestors
  const category = await getCategoryByPath(slug)

  if (!category) {
    notFound()
  }

  // Get effective colors and background image
  const colors = getEffectiveColors(category)
  const backgroundImage = getEffectiveBackgroundImage(category)
  const textOnPrimary = isLightColor(colors.primary) ? '#1A1A1A' : '#FFFFFF'

  // Fetch child categories and buttons in parallel
  const payload = await getPayload()
  const [childCategories, buttonsResult] = await Promise.all([
    getChildCategories(category.id),
    payload.find({
      collection: 'buttons',
      where: {
        category: { equals: category.id },
        active: { equals: true },
      },
      sort: 'name',
      limit: 100,
    }),
  ])

  const buttons: Button[] = buttonsResult.docs.map((doc) => toButton(doc as unknown as PayloadButton))

  // Build the current category path for child links
  const basePath = `/category/${slug.join('/')}`

  // Get counts and preview images for each child category
  const childIds = childCategories.map(c => c.id)
  const [childPreviewImages, ...childCountsResults] = await Promise.all([
    getRandomButtonImagesForCategories(childIds),
    ...childCategories.map(async (child) => {
      const [subcategoryCount, buttonCount] = await Promise.all([
        getSubcategoryCount(child.id),
        getButtonCount(child.id)
      ])
      return { subcategoryCount, buttonCount }
    })
  ])

  const childCategoriesWithCounts = childCategories.map((child, i) => ({
    category: child,
    href: `${basePath}/${child.slug}`,
    subcategoryCount: childCountsResults[i].subcategoryCount,
    buttonCount: childCountsResults[i].buttonCount,
    previewImage: childPreviewImages.get(child.id) ?? null,
  }))

  // Build breadcrumbs
  const breadcrumbs = buildBreadcrumbs(category)

  const nonEmptyChildren = childCategoriesWithCounts.filter(
    c => c.subcategoryCount > 0 || c.buttonCount > 0
  )

  const hasSubcategories = nonEmptyChildren.length > 0
  const hasButtons = buttons.length > 0

  return (
    <main className="min-h-screen bg-glow">
      {/* Header Banner with optional background image */}
      <div
        className="relative overflow-hidden"
        style={{
          background: backgroundImage
            ? `linear-gradient(135deg, ${colors.primary}DD 0%, ${colors.primary}BB 60%, ${colors.secondary}BB 100%)`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}EE 60%, ${colors.secondary} 100%)`,
        }}
      >
        {/* Background Image */}
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
        )}

        {/* Overlay for image (darker for better text readability) */}
        {backgroundImage && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}DD 0%, ${colors.primary}BB 60%, ${colors.secondary}BB 100%)`,
            }}
          />
        )}

        {/* Decorative pattern (only when no image) */}
        {!backgroundImage && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${colors.secondary} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${colors.secondary} 0%, transparent 50%)`,
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          {/* Breadcrumbs */}
          <CategoryBreadcrumb
            items={breadcrumbs}
            className="mb-4"
            style={{ color: textOnPrimary, opacity: 0.9 }}
          />

          {/* Page Title */}
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: textOnPrimary }}
          >
            {category.name}
          </h1>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            {hasSubcategories && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${textOnPrimary}20`,
                  color: textOnPrimary,
                }}
              >
                {nonEmptyChildren.length} subcategories
              </span>
            )}
            {hasButtons && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${textOnPrimary}20`,
                  color: textOnPrimary,
                }}
              >
                {buttons.length} buttons
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Subcategories */}
        {hasSubcategories && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span
                className="w-1 h-5 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              Browse {category.name}
            </h2>
            <CategoryGrid
              categories={nonEmptyChildren}
              accentColor={colors.primary}
            />
          </section>
        )}

        {/* Separator if both subcategories and buttons exist */}
        {hasSubcategories && hasButtons && (
          <hr className="border-border my-6" />
        )}

        {/* Buttons */}
        {hasButtons && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span
                className="w-1 h-5 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              {hasSubcategories ? `Buttons in ${category.name}` : 'Available Buttons'}
            </h2>
            <CategoryContent buttons={buttons} accentColor={colors.primary} />
          </section>
        )}

        {/* Empty State */}
        {!hasSubcategories && !hasButtons && (
          <div className="text-center py-8 px-4 bg-card rounded-xl border border-border">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <svg className="w-8 h-8" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              No buttons or subcategories available in this category yet.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
