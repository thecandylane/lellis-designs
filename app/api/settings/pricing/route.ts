import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

// Public endpoint - no auth required
// Returns pricing config from SiteSettings for public shopfront use
export async function GET() {
  try {
    const payload = await getPayload()

    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    return NextResponse.json({
      singlePrice: settings.singlePrice ?? 5,
      tier1Price: settings.tier1Price ?? 4.5,
      tier1Threshold: settings.tier1Threshold ?? 100,
      tier2Price: settings.tier2Price ?? 4,
      tier2Threshold: settings.tier2Threshold ?? 200,
      shippingCost: settings.shippingCost ?? 8,
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    // Return default pricing on error so shopfront doesn't break
    return NextResponse.json({
      singlePrice: 5,
      tier1Price: 4.5,
      tier1Threshold: 100,
      tier2Price: 4,
      tier2Threshold: 200,
      shippingCost: 8,
    })
  }
}
