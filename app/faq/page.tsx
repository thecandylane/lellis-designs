import Link from 'next/link'
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react'
import { Footer } from '@/components/home/Footer'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type FAQItem = {
  question: string
  answer: string
  order?: number
}

export default async function FAQPage() {
  // Fetch FAQ content from site settings
  let faqContent = {
    faqPageTitle: 'Frequently Asked Questions',
    faqPageSubtitle: 'Common questions about our buttons',
    faqIntroText: 'Here are answers to the most common questions we receive. Can\'t find what you\'re looking for? Feel free to contact us.',
    faqItems: [] as FAQItem[],
    faqContactPrompt: 'Still Have Questions?',
    faqContactDescription: 'We\'re here to help! Reach out and we\'ll get back to you as soon as possible.',
  }

  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({ slug: 'site-settings' })

    faqContent = {
      faqPageTitle: settings.faqPageTitle || faqContent.faqPageTitle,
      faqPageSubtitle: settings.faqPageSubtitle || faqContent.faqPageSubtitle,
      faqIntroText: settings.faqIntroText || faqContent.faqIntroText,
      faqItems: (settings.faqItems as FAQItem[]) || [],
      faqContactPrompt: settings.faqContactPrompt || faqContent.faqContactPrompt,
      faqContactDescription: settings.faqContactDescription || faqContent.faqContactDescription,
    }
  } catch (error) {
    console.error('Failed to fetch FAQ content:', error)
  }

  // Sort FAQ items by order field
  const sortedFaqs = faqContent.faqItems.sort((a, b) => (a.order || 0) - (b.order || 0))
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{faqContent.faqPageTitle}</h1>
            <p className="text-sm text-muted-foreground">{faqContent.faqPageSubtitle}</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="bg-primary/5 rounded-xl p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground mb-1">Got Questions?</h2>
            <p className="text-sm text-muted-foreground">
              {faqContent.faqIntroText.split('contact us')[0]}
              <Link href="/contact" className="text-primary hover:underline">contact us</Link>
              {faqContent.faqIntroText.includes('contact us') ? '.' : ''}
            </p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {sortedFaqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-card rounded-xl border border-border overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 text-muted-foreground text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Still Have Questions */}
        <section className="mt-12 bg-card rounded-xl border border-border p-6 text-center">
          <h3 className="font-semibold text-foreground mb-2">{faqContent.faqContactPrompt}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {faqContent.faqContactDescription}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  )
}
