import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { Footer } from '@/components/home/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Our policies and agreements</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Terms of Service</h2>
              <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-foreground">Agreement to Terms</h3>
              <p>
                By placing an order with L. Ellis Designs, you agree to these terms of service.
                Please read them carefully before making a purchase.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Products</h3>
              <p>
                All buttons are handmade 3-inch pin-back buttons. While we strive for consistency,
                minor variations may occur as each button is individually crafted. Product images
                are representative and actual items may vary slightly in color due to monitor settings.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Pricing and Payment</h3>
              <p>
                All prices are listed in US dollars. We accept payment through Stripe, which supports
                major credit cards. Payment is required at the time of order. Prices are subject to
                change without notice, but orders placed at a specific price will be honored.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Custom Orders</h3>
              <p>
                Custom orders require approval of a digital proof before production begins.
                Once production starts, custom orders cannot be canceled or modified.
                Please review your proof carefully before approving.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Shipping</h3>
              <p>
                We ship via UPS Ground to addresses within the United States. Shipping times are
                estimates and not guaranteed. We are not responsible for delays caused by the carrier,
                weather, or other circumstances beyond our control.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Returns and Refunds</h3>
              <p>
                Due to the custom nature of our products, we generally do not accept returns.
                However, if your order arrives damaged or is incorrect, please contact us within
                7 days of delivery and we will work to resolve the issue. Please include photos
                of any damage or defects.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Intellectual Property</h3>
              <p>
                By submitting custom artwork or designs, you confirm that you have the right to
                use that content and grant us permission to produce buttons featuring it. We are
                not responsible for copyright or trademark issues arising from customer-submitted designs.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Limitation of Liability</h3>
              <p>
                L. Ellis Designs shall not be liable for any indirect, incidental, or consequential
                damages arising from the use of our products or services. Our liability is limited
                to the purchase price of the products ordered.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Changes to Terms</h3>
              <p>
                We reserve the right to update these terms at any time. Changes will be posted on
                this page with an updated revision date. Continued use of our services constitutes
                acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Contact</h3>
              <p>
                Questions about these terms? Please{' '}
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
