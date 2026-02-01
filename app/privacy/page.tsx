import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { Footer } from '@/components/home/Footer'
import { getPayload } from '@/lib/payload'
import { renderRichText } from '@/lib/renderRichText'

export const dynamic = 'force-dynamic'

export default async function PrivacyPage() {
  let legalContent: any = null

  try {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'legal-pages',
      where: {
        slug: {
          equals: 'privacy',
        },
      },
      limit: 1,
    })

    legalContent = docs[0] || null
  } catch (error) {
    console.error('Failed to fetch privacy content:', error)
  }

  if (!legalContent) {
    return (
      <main className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">How we handle your information</p>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-card rounded-xl border border-border p-6 md:p-8 text-center">
            <p className="text-muted-foreground">
              Privacy Policy content is not yet available. Please check back later or{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>{' '}
              if you have questions.
            </p>
          </div>
        </div>

        <Footer />
      </main>
    )
  }

  const lastUpdatedDate = legalContent.lastUpdated
    ? new Date(legalContent.lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{legalContent.title}</h1>
            {legalContent.subtitle && (
              <p className="text-sm text-muted-foreground">{legalContent.subtitle}</p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{legalContent.title}</h2>
              {lastUpdatedDate && (
                <p className="text-sm text-muted-foreground">Last updated: {lastUpdatedDate}</p>
              )}
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            {legalContent.content && renderRichText(legalContent.content)}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
