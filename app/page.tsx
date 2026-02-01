import Image from 'next/image'
import { getRootCategories, getSubcategoryCount, getButtonCount, getRandomButtonImagesForCategories } from '@/lib/categories'
import { getPayload } from '@/lib/payload'
import CategoryGrid from '@/components/ui/CategoryGrid'
import HeroBallpit from '@/components/ui/HeroBallpit'
import ShopNowButton from '@/components/ui/ShopNowButton'
import HomeButtonShowcase from '@/components/ui/HomeButtonShowcase'
import { Features } from '@/components/home/Features'
import { CTASection } from '@/components/home/CTASection'
import { Footer } from '@/components/home/Footer'
import { TrustStrip } from '@/components/ui/TrustStrip'
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
    // Fetch featured buttons separately to ensure they're included
    const { docs: featuredButtons } = await payload.find({
      collection: 'buttons',
      where: {
        and: [
          { featured: { equals: true } },
          { active: { equals: true } },
        ],
      },
      sort: 'sortOrder',
      limit: 20,
      depth: 1,
    })

    // Fetch remaining active buttons
    const { docs: regularButtons } = await payload.find({
      collection: 'buttons',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    // Combine and deduplicate (featured buttons first)
    const featuredIds = new Set(featuredButtons.map(b => b.id))
    const buttons = [
      ...featuredButtons,
      ...regularButtons.filter(b => !featuredIds.has(b.id))
    ]

    // Map Payload buttons to our Button type
    allButtons = buttons.map((b) => {
      const imageObj = typeof b.image === 'object' ? b.image : null
      return {
        id: String(b.id),
        category_id: typeof b.category === 'object' && b.category ? String(b.category.id) : (b.category ? String(b.category) : null),
        name: b.name,
        description: b.description || null,
        tags: null,
        image_url: imageObj?.url || '/placeholder.png',
        // Use Payload's pre-generated sizes to avoid Next.js transformations
        image_thumbnail: imageObj?.sizes?.thumbnail?.url,
        image_card: imageObj?.sizes?.card?.url,
        price: b.price,
        lead_time_days: 0,
        customization: 'as_is' as const,
        active: b.active,
        featured: b.featured ?? false,
        sku: null,
      }
    })
  } catch (error) {
    console.error('Failed to fetch buttons:', error)
  }

  // Fetch pricing, background images, and social proof from site settings
  let pricing = {
    singlePrice: 5,
    tier1Price: 4.5,
    tier1Threshold: 100,
    tier2Price: 4,
    tier2Threshold: 200,
  }
  let homepageFeaturedBackgroundImage: string | null = null
  let socialProof = {
    customerRating: 5.0,
    customerCount: '500+',
    businessDescription: 'Handcrafted 3-inch buttons made with love in Baton Rouge. Perfect for sports teams, schools, and special celebrations.',
  }
  let footerSettings = {
    footerEmail: 'hello@lellisdesigns.com',
    footerLocation: 'Baton Rouge, LA',
    footerNavigation: undefined as any,
    businessInstagram: 'https://instagram.com/lellisdesigns',
  }
  let featuresSettings = {
    featuresHeading: 'Why Choose L. Ellis Designs?',
    featuresSubheading: 'We\'re passionate about creating buttons that celebrate your team, your school, and your special moments.',
    featureItems: undefined as any,
  }
  let ctaSettings = {
    homepageCtaHeading: 'Have a Special Design in Mind?',
    homepageCtaSubtext: 'We love bringing your ideas to life! Whether it\'s custom names, photos, or unique designs - we\'re here to help create something special.',
    homepageCtaButton1Text: 'Request Custom Design',
    homepageCtaButton2Text: 'Browse Existing Designs',
  }

  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
    pricing = {
      singlePrice: settings.singlePrice ?? 5,
      tier1Price: settings.tier1Price ?? 4.5,
      tier1Threshold: settings.tier1Threshold ?? 100,
      tier2Price: settings.tier2Price ?? 4,
      tier2Threshold: settings.tier2Threshold ?? 200,
    }
    // Get background image URL
    if (typeof settings.homepageFeaturedBackgroundImage === 'object' && settings.homepageFeaturedBackgroundImage?.url) {
      homepageFeaturedBackgroundImage = settings.homepageFeaturedBackgroundImage.url
    }
    // Get social proof settings
    socialProof = {
      customerRating: settings.customerRating ?? 5.0,
      customerCount: settings.customerCount ?? '500+',
      businessDescription: settings.businessDescription ?? 'Handcrafted 3-inch buttons made with love in Baton Rouge. Perfect for sports teams, schools, and special celebrations.',
    }
    // Get footer settings - use undefined for empty arrays so component defaults are used
    footerSettings = {
      footerEmail: settings.footerEmail ?? 'hello@lellisdesigns.com',
      footerLocation: settings.footerLocation ?? 'Baton Rouge, LA',
      footerNavigation: settings.footerNavigation?.length ? settings.footerNavigation : undefined,
      businessInstagram: settings.businessInstagram ?? 'https://instagram.com/lellisdesigns',
    }
    // Get features settings - use undefined for empty arrays so component defaults are used
    featuresSettings = {
      featuresHeading: settings.featuresHeading ?? 'Why Choose L. Ellis Designs?',
      featuresSubheading: settings.featuresSubheading ?? 'We\'re passionate about creating buttons that celebrate your team, your school, and your special moments.',
      featureItems: settings.featureItems?.length ? settings.featureItems : undefined,
    }
    // Get CTA settings
    ctaSettings = {
      homepageCtaHeading: settings.homepageCtaHeading ?? 'Have a Special Design in Mind?',
      homepageCtaSubtext: settings.homepageCtaSubtext ?? 'We love bringing your ideas to life! Whether it\'s custom names, photos, or unique designs - we\'re here to help create something special.',
      homepageCtaButton1Text: settings.homepageCtaButton1Text ?? 'Request Custom Design',
      homepageCtaButton2Text: settings.homepageCtaButton2Text ?? 'Browse Existing Designs',
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
              <TrustStrip rating={socialProof.customerRating} customerCount={socialProof.customerCount} className="mb-6" />

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

      {/* Featured Button Showcase */}
      {allButtons.filter(b => b.featured).length > 0 && (
        <HomeButtonShowcase
          buttons={allButtons.filter(b => b.featured)}
          backgroundImageUrl={homepageFeaturedBackgroundImage}
        />
      )}

      {/* Categories */}
      <section id="categories" className="py-12 md:py-16 bg-pattern-geometric scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
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

      {/* Features Section - Why Choose L. Ellis Designs */}
      <Features
        featuresHeading={featuresSettings.featuresHeading}
        featuresSubheading={featuresSettings.featuresSubheading}
        featureItems={featuresSettings.featureItems}
      />

      {/* Custom Request CTA */}
      <CTASection
        homepageCtaHeading={ctaSettings.homepageCtaHeading}
        homepageCtaSubtext={ctaSettings.homepageCtaSubtext}
        homepageCtaButton1Text={ctaSettings.homepageCtaButton1Text}
        homepageCtaButton2Text={ctaSettings.homepageCtaButton2Text}
      />

      {/* Footer */}
      <Footer
        businessDescription={socialProof.businessDescription}
        footerEmail={footerSettings.footerEmail}
        footerLocation={footerSettings.footerLocation}
        footerNavigation={footerSettings.footerNavigation}
        businessInstagram={footerSettings.businessInstagram}
      />
    </main>
  )
}
