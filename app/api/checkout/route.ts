import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import type { CartItem } from '@/lib/types'
import { getPayload } from '@/lib/payload'

type ShippingMethod = 'pickup' | 'ups'

type CheckoutRequest = {
  items: CartItem[]
  email: string
  neededByDate: string
  shippingMethod: ShippingMethod
}

// Fetch pricing from SiteSettings
async function getPricing() {
  const payload = await getPayload()
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  return {
    singlePrice: settings.singlePrice ?? 5,
    tier1Price: settings.tier1Price ?? 4.5,
    tier1Threshold: settings.tier1Threshold ?? 100,
    tier2Price: settings.tier2Price ?? 4,
    tier2Threshold: settings.tier2Threshold ?? 200,
    shippingCost: settings.shippingCost ?? 8,
  }
}

// Calculate price per button based on quantity and pricing config
function getPricePerButton(quantity: number, pricing: { singlePrice: number; tier1Price: number; tier1Threshold: number; tier2Price: number; tier2Threshold: number }) {
  if (quantity >= pricing.tier2Threshold) return pricing.tier2Price
  if (quantity >= pricing.tier1Threshold) return pricing.tier1Price
  return pricing.singlePrice
}

// Security: Input validation limits
const MAX_ITEMS = 100
const MAX_NAME_LENGTH = 100
const MAX_PERSON_NAME_LENGTH = 50
const MAX_PERSON_NUMBER_LENGTH = 30
const MAX_NOTES_LENGTH = 500
const MAX_QUANTITY_PER_ITEM = 1000

function validateCartItems(items: CartItem[]): string | null {
  if (items.length > MAX_ITEMS) {
    return `Maximum ${MAX_ITEMS} different items allowed`
  }

  for (const item of items) {
    if (!item.buttonId || !item.name) {
      return 'Invalid item: missing required fields'
    }
    if (item.name.length > MAX_NAME_LENGTH) {
      return `Item name exceeds ${MAX_NAME_LENGTH} characters`
    }
    if (item.personName && item.personName.length > MAX_PERSON_NAME_LENGTH) {
      return `Person name exceeds ${MAX_PERSON_NAME_LENGTH} characters`
    }
    if (item.personNumber && item.personNumber.length > MAX_PERSON_NUMBER_LENGTH) {
      return `Number/class exceeds ${MAX_PERSON_NUMBER_LENGTH} characters`
    }
    if (item.notes && item.notes.length > MAX_NOTES_LENGTH) {
      return `Notes exceed ${MAX_NOTES_LENGTH} characters`
    }
    if (!item.quantity || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
      return `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}`
    }
  }

  return null
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    const { items, email, neededByDate, shippingMethod = 'pickup' } = body

    // Get ambassador code from cookie if present
    const ambassadorCode = request.cookies.get('ambassador_code')?.value || null

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!neededByDate) {
      return NextResponse.json({ error: 'Needed-by date is required' }, { status: 400 })
    }

    // Validate cart items
    const validationError = validateCartItems(items)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Validate shipping method
    if (shippingMethod !== 'pickup' && shippingMethod !== 'ups') {
      return NextResponse.json({ error: 'Invalid shipping method' }, { status: 400 })
    }

    // Fetch dynamic pricing from SiteSettings
    const pricing = await getPricing()

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const pricePerItem = Math.round(getPricePerButton(totalQuantity, pricing) * 100) // Convert to cents
    const shippingCostCents = Math.round(pricing.shippingCost * 100) // Convert to cents
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const lineItems = items.map((item) => {
      const description = [
        item.personName && `Name: ${item.personName}`,
        item.personNumber && `Number/Class: ${item.personNumber}`,
        item.notes && `Notes: ${item.notes}`,
      ]
        .filter(Boolean)
        .join(' | ')

      // Stripe requires absolute URLs for images
      // If relative, make absolute; if invalid, skip images entirely
      let images: string[] | undefined
      if (item.imageUrl) {
        if (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')) {
          images = [item.imageUrl]
        } else if (item.imageUrl.startsWith('/')) {
          // Relative URL - make absolute using origin
          images = [`${origin}${item.imageUrl}`]
        }
        // Otherwise skip images (invalid URL format)
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: description || undefined,
            ...(images && { images }),
          },
          unit_amount: pricePerItem,
        },
        quantity: item.quantity,
      }
    })

    const customizationsMetadata = items.map((item) => ({
      buttonId: item.buttonId,
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      personName: item.personName,
      personNumber: item.personNumber,
      notes: item.notes,
    }))

    // Add shipping as a line item for UPS orders
    const allLineItems = [...lineItems]
    if (shippingMethod === 'ups') {
      allLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'UPS Shipping',
            description: 'Flat rate shipping',
          },
          unit_amount: shippingCostCents,
        },
        quantity: 1,
      })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: allLineItems,
      automatic_tax: { enabled: true },
      metadata: {
        email,
        neededByDate,
        shippingMethod,
        itemsJson: JSON.stringify(customizationsMetadata),
        ...(ambassadorCode && { ambassadorCode }),
      },
      // Collect shipping address for UPS orders
      ...(shippingMethod === 'ups' && {
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      }),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    // Log full error server-side for debugging
    console.error('Checkout error:', error instanceof Error ? error.message : error)
    // Return generic message to client - never expose internals
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
