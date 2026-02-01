import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { Footer } from '@/components/home/Footer'
import { getIcon } from '@/lib/iconMapping'

export const dynamic = 'force-dynamic'

interface GalleryImage {
  image: {
    url?: string
    alt?: string
  }
  caption?: string
}

type ValueCard = {
  title: string
  description: string
  icon: string
  colorClass: string
}

export default async function AboutPage() {
  // Fetch about page content from site settings
  let aboutContent = {
    aboutTitle: 'About L. Ellis Designs',
    aboutSubtitle: 'Handcrafted buttons made with love in Baton Rouge',
    ownerName: '',
    ownerPhoto: null as { url?: string; alt?: string } | null,
    aboutStory: '',
    galleryImages: [] as GalleryImage[],
    instagramUrl: '',
    aboutHeroBackgroundImage: null as string | null,
    aboutValueCards: [] as ValueCard[],
    aboutCtaHeading: 'Ready to Create Something Special?',
    aboutCtaButton1Text: 'Browse Buttons',
    aboutCtaButton2Text: 'Custom Order',
  }

  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 2, // Ensure media relations are populated
    })

    aboutContent = {
      aboutTitle: settings.aboutTitle || aboutContent.aboutTitle,
      aboutSubtitle: settings.aboutSubtitle || aboutContent.aboutSubtitle,
      ownerName: settings.ownerName || '',
      ownerPhoto: typeof settings.ownerPhoto === 'object' ? settings.ownerPhoto : null,
      aboutStory: settings.aboutStory || '',
      galleryImages: (settings.galleryImages as GalleryImage[]) || [],
      instagramUrl: settings.instagramUrl || '',
      aboutHeroBackgroundImage: typeof settings.aboutHeroBackgroundImage === 'object' && settings.aboutHeroBackgroundImage?.url
        ? settings.aboutHeroBackgroundImage.url
        : null,
      aboutValueCards: (settings.aboutValueCards as ValueCard[]) || [],
      aboutCtaHeading: settings.aboutCtaHeading || aboutContent.aboutCtaHeading,
      aboutCtaButton1Text: settings.aboutCtaButton1Text || aboutContent.aboutCtaButton1Text,
      aboutCtaButton2Text: settings.aboutCtaButton2Text || aboutContent.aboutCtaButton2Text,
    }
  } catch (error) {
    console.error('Failed to fetch about content:', error)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">About Us</h1>
            <p className="text-sm text-muted-foreground">Learn more about L. Ellis Designs</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-12 md:py-16 relative ${!aboutContent.aboutHeroBackgroundImage ? 'bg-glow' : ''}`}>
        {/* Background Image */}
        {aboutContent.aboutHeroBackgroundImage && (
          <>
            <div className="absolute inset-0 -z-20 overflow-hidden">
              <Image
                src={aboutContent.aboutHeroBackgroundImage}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            <div className="absolute inset-0 -z-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }} />
          </>
        )}
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {aboutContent.aboutTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {aboutContent.aboutSubtitle}
          </p>
        </div>
      </section>

      {/* Values/Highlights Section */}
      {aboutContent.aboutValueCards.length > 0 && (
        <section className="py-12 bg-background">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {aboutContent.aboutValueCards.map((card, index) => {
                const IconComponent = getIcon(card.icon);
                return (
                  <div key={index} className="bg-card rounded-xl p-6 border border-border text-center">
                    <div className={`w-12 h-12 ${card.colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      <section id="story" className="py-12 md:py-16 bg-muted/30 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Story</h2>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
            {aboutContent.ownerPhoto?.url || aboutContent.ownerName ? (
              <div className="md:flex gap-8 items-start">
                {aboutContent.ownerPhoto?.url && (
                  <div className="flex-shrink-0 mb-6 md:mb-0">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0 rounded-full overflow-hidden ring-4 ring-primary/20">
                      <Image
                        src={aboutContent.ownerPhoto.url}
                        alt={aboutContent.ownerName || 'Owner'}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                    {aboutContent.ownerName && (
                      <p className="text-center md:text-left mt-3 font-semibold text-foreground">
                        {aboutContent.ownerName}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  {aboutContent.aboutStory ? (
                    <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                      {aboutContent.aboutStory.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Our story is coming soon! Check back later to learn more about how L. Ellis Designs got started.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                {aboutContent.aboutStory ? (
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground text-left">
                    {aboutContent.aboutStory.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Our story is coming soon! Check back later to learn more about how L. Ellis Designs got started.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {aboutContent.galleryImages.length > 0 && (
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {aboutContent.galleryImages.map((item, index) => (
                item.image?.url && (
                  <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={item.image.url}
                      alt={item.caption || item.image.alt || `Gallery image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {item.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-white text-sm font-medium">{item.caption}</p>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {aboutContent.aboutCtaHeading}
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Whether you need buttons for your team, school, or special event, we&apos;d love to help bring your vision to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              {aboutContent.aboutCtaButton1Text}
            </Link>
            <Link
              href="/custom-request"
              className="inline-flex items-center px-6 py-3 bg-primary-foreground/10 text-primary-foreground font-semibold rounded-lg border-2 border-primary-foreground/30 hover:bg-primary-foreground/20 transition-colors"
            >
              {aboutContent.aboutCtaButton2Text}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
