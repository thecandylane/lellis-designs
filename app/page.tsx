import Image from 'next/image'
import dynamicImport from 'next/dynamic'
import { getRootCategories, getSubcategoryCount, getButtonCount, getRandomButtonImagesForCategories } from '@/lib/categories'
import { getPayload } from '@/lib/payload'
import CategoryGrid from '@/components/ui/CategoryGrid'
import ShopNowButton from '@/components/ui/ShopNowButton'
import HomeButtonShowcase from '@/components/ui/HomeButtonShowcase'

// Code-split 3D component to reduce initial bundle size (~200KB+ savings)
const HeroBallpit = dynamicImport(() => import('@/components/ui/HeroBallpit'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] md:h-[600px] bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl" />
  ),
})
import { Features } from '@/components/home/Features'
import { CTASection } from '@/components/home/CTASection'
import { Footer } from '@/components/home/Footer'
import { Star } from 'lucide-react'
import type { Category, Button } from '@/lib/types'

export const dynamic = 'force-dynamic'

type CategoryWithCounts = {
  category: Category
  href: string
  subcategoryCount: number
  buttonCount: number
  previewImage?: string | null
}

export default async function HomePage() {
  let categoriesWithCounts: CategoryWithCounts[] = []
  let rootCategories: Category[] = []
  let allButtons: Button[] = []

  try {
    rootCategories = await getRootCategories()

    // Get counts and preview images for each root category
    const categoryIds = rootCategories.map(c => c.id)
    const [previewImages, ...countsResults] = await Promise.all([
      getRandomButtonImagesForCategories(categoryIds),
      ...rootCategories.map(async (category) => {
        const [subcategoryCount, buttonCount] = await Promise.all([
          getSubcategoryCount(category.id),
          getButtonCount(category.id)
        ])
        return { subcategoryCount, buttonCount }
      })
    ])

    categoriesWithCounts = rootCategories.map((category, i) => ({
      category,
      href: `/category/${category.slug}`,
      subcategoryCount: countsResults[i].subcategoryCount,
      buttonCount: countsResults[i].buttonCount,
      previewImage: previewImages.get(category.id) ?? null,
    }))
  } catch (error) {
    // Database not initialized yet - show empty state
    console.error('Database initialization pending:', error)
  }

  // Fetch all active buttons for the showcase
  try {
    const payload = await getPayload()
    const { docs: buttons } = await payload.find({
      collection: 'buttons',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    // Map Payload buttons to our Button type
    allButtons = buttons.map((b) => ({
      id: String(b.id),
      category_id: typeof b.category === 'object' && b.category ? String(b.category.id) : (b.category ? String(b.category) : null),
      name: b.name,
      description: b.description || null,
      tags: null,
      image_url: typeof b.image === 'object' && b.image?.url ? b.image.url : '/placeholder.png',
      price: b.price ?? null,
      lead_time_days: 0,
      customization: 'as_is' as const,
      active: b.active,
      featured: b.featured ?? false,
      sku: null,
    }))
  } catch (error) {
    console.error('Failed to fetch buttons:', error)
  }

  // Fetch pricing from site settings
  let pricing = {
    singlePrice: 5,
    tier1Price: 4.5,
    tier1Threshold: 100,
    tier2Price: 4,
    tier2Threshold: 200,
  }
  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    pricing = {
      singlePrice: settings.singlePrice ?? 5,
      tier1Price: settings.tier1Price ?? 4.5,
      tier1Threshold: settings.tier1Threshold ?? 100,
      tier2Price: settings.tier2Price ?? 4,
      tier2Threshold: settings.tier2Threshold ?? 200,
    }
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with 3D Ballpit Background */}
      <section className="relative min-h-[550px] md:min-h-[650px] overflow-hidden bg-glow">
        {/* 3D Ballpit Background */}
        <HeroBallpit />

        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Logo */}
            <div className="relative w-36 h-36 md:w-52 md:h-52 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-secondary/20 blur-xl animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-secondary shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="L. Ellis Designs"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 144px, 208px"
                />
              </div>
            </div>

            {/* Hero Content */}
            <div className="text-center md:text-left flex-1 p-6 md:p-8 rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-white/50">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">
                L. Ellis Designs
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-5">
                Custom 3&quot; Buttons for Every Occasion
              </p>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">5.0</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Trusted by 500+ teams</span>
              </div>

              {/* Pricing badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <span className="inline-flex items-center border-2 border-primary/30 bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-sm font-semibold">
                  ${pricing.singlePrice.toFixed(2)} each
                </span>
                <span className="inline-flex items-center border-2 border-secondary/30 bg-secondary/5 text-secondary px-3 py-1.5 rounded-lg text-sm font-semibold">
                  Bulk discounts available
                </span>
              </div>

              {/* CTA Button */}
              <ShopNowButton />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Featured Button Showcase */}
      {allButtons.filter(b => b.featured).length > 0 && (
        <HomeButtonShowcase buttons={allButtons.filter(b => b.featured)} />
      )}

      {/* Categories - Full width layout */}
      <section id="categories" className="py-12 md:py-16 bg-pattern-geometric scroll-mt-20">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Browse Categories
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find the perfect buttons for your team, school, or event
            </p>
          </div>
          <CategoryGrid
            categories={categoriesWithCounts.filter(c => c.subcategoryCount > 0 || c.buttonCount > 0)}
            emptyMessage="No categories available yet. Check back soon!"
          />
        </div>
      </section>

      {/* Custom Request CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
