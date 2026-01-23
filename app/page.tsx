import Image from 'next/image'
import Link from 'next/link'
import { getRootCategories, getSubcategoryCount, getButtonCount } from '@/lib/categories'
import CategoryGrid from '@/components/ui/CategoryGrid'
import HeroBallpit from '@/components/ui/HeroBallpit'
import { CustomRequestCTA } from '@/components/ui/CustomRequestCTA'
import { ShoppingBag, Truck, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let categoriesWithCounts: any[] = []

  try {
    const rootCategories = await getRootCategories()

    // Get counts for each root category
    categoriesWithCounts = await Promise.all(
      rootCategories.map(async (category) => {
        const [subcategoryCount, buttonCount] = await Promise.all([
          getSubcategoryCount(category.id),
          getButtonCount(category.id)
        ])
        return {
          category,
          href: `/category/${category.slug}`,
          subcategoryCount,
          buttonCount
        }
      })
    )
  } catch (error) {
    // Database not initialized yet - show empty state
    console.error('Database initialization pending:', error)
  }

  return (
    <main className="min-h-screen bg-glow">
      {/* Hero Section with 3D Ballpit Background */}
      <section className="relative min-h-[500px] md:min-h-[600px] overflow-hidden">
        {/* 3D Ballpit Background */}
        <HeroBallpit />

        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Logo */}
            <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-secondary/20 blur-xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-secondary shadow-2xl">
                <Image
                  src="/logo.png"
                  alt="L. Ellis Designs"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 160px, 224px"
                />
              </div>
            </div>

            {/* Hero Content */}
            <div className="text-center md:text-left flex-1 p-6 md:p-8 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
                L. Ellis Designs
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80 mb-6">
                Custom 3&quot; Buttons for Every Occasion
              </p>

              {/* Pricing badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                <span className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  $5 each
                </span>
                <span className="inline-flex items-center bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  Bulk discounts available
                </span>
              </div>

              {/* CTA Button */}
              <Link
                href="#categories"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
              </Link>
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

      {/* Features */}
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-shadow">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Handcrafted</h3>
                <p className="text-xs text-muted-foreground">Made with love in Louisiana</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-shadow">
              <div className="p-2.5 rounded-xl bg-secondary/10">
                <Truck className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Fast Shipping</h3>
                <p className="text-xs text-muted-foreground">Local pickup or UPS delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-shadow">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <ShoppingBag className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Bulk Discounts</h3>
                <p className="text-xs text-muted-foreground">$4.50/ea for 100+, $4/ea for 200+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-8 md:py-12 bg-pattern-geometric scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Browse Categories
            </h2>
            <p className="text-base text-muted-foreground">
              Find the perfect buttons for your team, school, or event
            </p>
          </div>
          <CategoryGrid
            categories={categoriesWithCounts}
            emptyMessage="No categories available yet. Check back soon!"
          />
        </div>
      </section>

      {/* Custom Request CTA */}
      <section className="py-8 md:py-10 bg-glow">
        <div className="max-w-3xl mx-auto px-4">
          <CustomRequestCTA />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-secondary/50">
                <Image
                  src="/logo.png"
                  alt="L. Ellis Designs"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <span className="font-bold">L. Ellis Designs</span>
                <span className="block text-xs text-primary-foreground/70">Louisiana</span>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-primary-foreground/80">
              <Link href="/" className="hover:text-secondary transition-colors">Shop</Link>
              <Link href="/custom-request" className="hover:text-secondary transition-colors">Custom Order</Link>
              <Link href="/cart" className="hover:text-secondary transition-colors">Cart</Link>
            </div>
            <p className="text-sm text-primary-foreground/60">
              &copy; {new Date().getFullYear()} L. Ellis Designs
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
