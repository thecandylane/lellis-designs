import Link from 'next/link'
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react'
import { Footer } from '@/components/home/Footer'

const faqs = [
  {
    question: 'What size are the buttons?',
    answer: 'All our buttons are 3 inches in diameter - the perfect size for visibility at events, games, and celebrations.',
  },
  {
    question: 'How do I place a custom order?',
    answer: 'Visit our Custom Request page to submit your design idea. You can upload an image or describe what you\'re looking for, and we\'ll work with you to create the perfect button.',
  },
  {
    question: 'What\'s the turnaround time for orders?',
    answer: 'Standard orders ship within 2-3 business days. Bulk orders (50+ buttons) may take 3-5 business days. Custom designs typically take 5-7 business days, which includes time for design approval.',
  },
  {
    question: 'Do you offer bulk discounts?',
    answer: 'Yes! We offer tiered pricing for larger orders. Orders of 100-199 buttons receive a discount, and orders of 200+ buttons receive an even better rate. Check our pricing on any product page.',
  },
  {
    question: 'Can I pick up my order locally?',
    answer: 'Absolutely! We offer free local pickup in Baton Rouge, Louisiana. Just select the pickup option at checkout, and we\'ll email you when your order is ready.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure checkout powered by Stripe.',
  },
  {
    question: 'Can I see a proof before my custom order is made?',
    answer: 'Yes! For custom orders, we\'ll send you a digital proof to approve before we start production. We want to make sure you\'re 100% happy with the design.',
  },
  {
    question: 'What if I\'m not satisfied with my order?',
    answer: 'Your satisfaction is important to us. If there\'s an issue with your order, please contact us within 7 days of receiving it, and we\'ll work to make it right.',
  },
  {
    question: 'Do you ship outside of Louisiana?',
    answer: 'Yes, we ship nationwide via UPS Ground. Shipping is a flat rate of $8.00 regardless of order size.',
  },
  {
    question: 'Can I order buttons for a school or team?',
    answer: 'Definitely! We specialize in buttons for schools, sports teams, and organizations. Check out our Sports and Schools categories for popular designs, or submit a custom request for your specific needs.',
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h1>
            <p className="text-sm text-muted-foreground">Common questions about our buttons</p>
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
              Here are answers to the most common questions we receive. Can&apos;t find what you&apos;re looking for? Feel free to{' '}
              <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
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
          <h3 className="font-semibold text-foreground mb-2">Still Have Questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We&apos;re here to help! Reach out and we&apos;ll get back to you as soon as possible.
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
