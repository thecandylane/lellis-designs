import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { getUser } from '@/lib/auth'

// Hex color validation
const isValidHex = (value: unknown): boolean => {
  if (typeof value !== 'string') return false
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

// Positive number validation
const isPositiveNumber = (value: unknown): boolean => {
  if (typeof value !== 'number') return false
  return value >= 0
}

export async function GET() {
  // Check authentication
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload()

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    return NextResponse.json({
      // Business Info
      businessName: settings.businessName || '',
      tagline: settings.tagline || '',
      pickupAddress: settings.pickupAddress || '',
      // Brand Colors
      primaryColor: settings.primaryColor || '#14B8A6',
      secondaryColor: settings.secondaryColor || '#EC4899',
      accentColor: settings.accentColor || '#84CC16',
      // Appearance
      heroStyle: settings.heroStyle || 'ballpit',
      cardStyle: settings.cardStyle || 'shadow',
      buttonStyle: settings.buttonStyle || 'rounded',
      animationIntensity: settings.animationIntensity || 'full',
      // Pricing
      singlePrice: settings.singlePrice ?? 5,
      tier1Price: settings.tier1Price ?? 4.5,
      tier1Threshold: settings.tier1Threshold ?? 100,
      tier2Price: settings.tier2Price ?? 4,
      tier2Threshold: settings.tier2Threshold ?? 200,
      shippingCost: settings.shippingCost ?? 8,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  // Check authentication
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    // Business Info
    businessName,
    tagline,
    pickupAddress,
    // Brand Colors
    primaryColor,
    secondaryColor,
    accentColor,
    // Appearance
    heroStyle,
    cardStyle,
    buttonStyle,
    animationIntensity,
    // Pricing
    singlePrice,
    tier1Price,
    tier1Threshold,
    tier2Price,
    tier2Threshold,
    shippingCost,
  } = body

  // Validate colors if provided
  const colorFields = { primaryColor, secondaryColor, accentColor }
  for (const [key, value] of Object.entries(colorFields)) {
    if (value !== undefined && !isValidHex(value)) {
      return NextResponse.json(
        { error: `Invalid ${key}: must be a valid hex color (e.g., #14B8A6)` },
        { status: 400 }
      )
    }
  }

  // Validate pricing if provided
  const priceFields = { singlePrice, tier1Price, tier2Price, shippingCost }
  for (const [key, value] of Object.entries(priceFields)) {
    if (value !== undefined && !isPositiveNumber(value)) {
      return NextResponse.json(
        { error: `Invalid ${key}: must be a positive number` },
        { status: 400 }
      )
    }
  }

  const thresholdFields = { tier1Threshold, tier2Threshold }
  for (const [key, value] of Object.entries(thresholdFields)) {
    if (value !== undefined && (!isPositiveNumber(value) || value < 1)) {
      return NextResponse.json(
        { error: `Invalid ${key}: must be a positive integer` },
        { status: 400 }
      )
    }
  }

  // Validate select fields
  const validHeroStyles = ['ballpit', 'gradient', 'solid']
  const validCardStyles = ['shadow', 'border', 'flat']
  const validButtonStyles = ['rounded', 'pill', 'square']
  const validAnimationIntensities = ['none', 'subtle', 'full']

  if (heroStyle !== undefined && !validHeroStyles.includes(heroStyle)) {
    return NextResponse.json({ error: 'Invalid heroStyle' }, { status: 400 })
  }
  if (cardStyle !== undefined && !validCardStyles.includes(cardStyle)) {
    return NextResponse.json({ error: 'Invalid cardStyle' }, { status: 400 })
  }
  if (buttonStyle !== undefined && !validButtonStyles.includes(buttonStyle)) {
    return NextResponse.json({ error: 'Invalid buttonStyle' }, { status: 400 })
  }
  if (animationIntensity !== undefined && !validAnimationIntensities.includes(animationIntensity)) {
    return NextResponse.json({ error: 'Invalid animationIntensity' }, { status: 400 })
  }

  const payload = await getPayload()

  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        // Business Info
        ...(businessName !== undefined && { businessName }),
        ...(tagline !== undefined && { tagline }),
        ...(pickupAddress !== undefined && { pickupAddress }),
        // Brand Colors
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        // Appearance
        ...(heroStyle !== undefined && { heroStyle }),
        ...(cardStyle !== undefined && { cardStyle }),
        ...(buttonStyle !== undefined && { buttonStyle }),
        ...(animationIntensity !== undefined && { animationIntensity }),
        // Pricing
        ...(singlePrice !== undefined && { singlePrice }),
        ...(tier1Price !== undefined && { tier1Price }),
        ...(tier1Threshold !== undefined && { tier1Threshold }),
        ...(tier2Price !== undefined && { tier2Price }),
        ...(tier2Threshold !== undefined && { tier2Threshold }),
        ...(shippingCost !== undefined && { shippingCost }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
