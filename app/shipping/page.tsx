import Link from 'next/link'
import { ArrowLeft, Package, Truck, MapPin, Clock } from 'lucide-react'
import { Footer } from '@/components/home/Footer'
import { getPayload } from '@/lib/payload'

export default async function ShippingPage() {
  // Fetch shipping settings
  let shippingSettings = {
    shippingCost: 8,
    shippingMethodTitle: 'UPS Ground Shipping',
    shippingMethodDescription: 'Standard delivery within 3-5 business days',
    localPickupTitle: 'Local Pickup',
    localPickupDescription: 'Free pickup in Baton Rouge, LA',
    standardProcessingDays: '2-3 business days',
    bulkProcessingDays: '3-5 business days',
    customProcessingDays: '5-7 business days (includes design approval)',
    pickupAvailability: 'Monday through Friday',
  }

  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    shippingSettings = {
      shippingCost: settings.shippingCost ?? 8,
      shippingMethodTitle: settings.shippingMethodTitle ?? 'UPS Ground Shipping',
      shippingMethodDescription: settings.shippingMethodDescription ?? 'Standard delivery within 3-5 business days',
      localPickupTitle: settings.localPickupTitle ?? 'Local Pickup',
      localPickupDescription: settings.localPickupDescription ?? 'Free pickup in Baton Rouge, LA',
      standardProcessingDays: settings.standardProcessingDays ?? '2-3 business days',
      bulkProcessingDays: settings.bulkProcessingDays ?? '3-5 business days',
      customProcessingDays: settings.customProcessingDays ?? '5-7 business days (includes design approval)',
      pickupAvailability: settings.pickupAvailability ?? 'Monday through Friday',
    }
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
  }
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Shipping Information</h1>
            <p className="text-sm text-muted-foreground">How we get your buttons to you</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Shipping Options */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Shipping Options</h2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex justify-between items-start pb-4 border-b border-border">
              <div>
                <h3 className="font-medium text-foreground">{shippingSettings.shippingMethodTitle}</h3>
                <p className="text-sm text-muted-foreground">{shippingSettings.shippingMethodDescription}</p>
              </div>
              <span className="text-lg font-semibold text-primary">${shippingSettings.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-foreground">{shippingSettings.localPickupTitle}</h3>
                <p className="text-sm text-muted-foreground">{shippingSettings.localPickupDescription}</p>
              </div>
              <span className="text-lg font-semibold text-green-600">Free</span>
            </div>
          </div>
        </section>

        {/* Processing Time */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Processing Time</h2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground mb-4">
              Most orders are processed and shipped within <strong className="text-foreground">{shippingSettings.standardProcessingDays}</strong>.
              Custom orders or bulk orders may require additional time.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Standard orders (1-50 buttons): {shippingSettings.standardProcessingDays}</span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Bulk orders (50+ buttons): {shippingSettings.bulkProcessingDays}</span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Custom designs: {shippingSettings.customProcessingDays}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Local Pickup */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Local Pickup</h2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground mb-4">
              Local pickup is available in Baton Rouge, Louisiana. When your order is ready,
              we&apos;ll send you an email with pickup details and address.
            </p>
            <p className="text-sm text-muted-foreground">
              Pickup is typically available {shippingSettings.pickupAvailability}. We&apos;ll coordinate a convenient time with you.
            </p>
          </div>
        </section>

        {/* Questions */}
        <section className="bg-primary/5 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-foreground mb-2">Have Questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Need expedited shipping or have special delivery requirements?
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
