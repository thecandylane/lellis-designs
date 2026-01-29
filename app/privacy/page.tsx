import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { Footer } from '@/components/home/Footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">How we protect your information</p>
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
              <h2 className="text-xl font-semibold text-foreground">Privacy Policy</h2>
              <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">Information We Collect</h3>
              <p>
                When you place an order or contact us, we collect information necessary to fulfill your request, including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and contact information (email address, phone number)</li>
                <li>Shipping address</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Order details and preferences</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Respond to your questions and requests</li>
                <li>Improve our products and services</li>
                <li>Send order confirmations and shipping updates</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Information Sharing</h3>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only with:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Payment processors (Stripe) to complete transactions</li>
                <li>Shipping carriers (UPS) to deliver your orders</li>
                <li>Service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information.
                Payment information is processed securely through Stripe and is never stored on our servers.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Cookies</h3>
              <p>
                We use cookies to improve your browsing experience, remember your cart contents,
                and understand how visitors use our site. You can control cookie settings in your browser.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
              <p>
                If you have questions about this privacy policy or your personal information, please{' '}
                <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
