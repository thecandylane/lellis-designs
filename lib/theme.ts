// Server-only theme utilities
import { getPayload } from '@/lib/payload'
import { DEFAULT_THEME, type ThemeSettings, type SeasonalTheme, type HeroStyle, type CardStyle, type ButtonStyle, type AnimationIntensity } from '@/lib/types/theme'
import { hexToHSL } from '@/lib/theme-utils'

// Re-export client-safe utilities for backwards compatibility
export { hexToHSL } from '@/lib/theme-utils'

type PayloadSiteSettings = {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  heroStyle?: HeroStyle
  cardStyle?: CardStyle
  buttonStyle?: ButtonStyle
  animationIntensity?: AnimationIntensity
  activeTheme?: string
  seasonalThemes?: SeasonalTheme[]
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    }) as PayloadSiteSettings

    if (!settings) {
      return DEFAULT_THEME
    }

    // Check if there's an active seasonal theme
    let primaryColor = settings.primaryColor || DEFAULT_THEME.primary_color
    let secondaryColor = settings.secondaryColor || DEFAULT_THEME.secondary_color
    let accentColor = settings.accentColor || DEFAULT_THEME.accent_color
    let heroStyle = settings.heroStyle || DEFAULT_THEME.hero_style
    let activeThemeName: string | undefined

    if (settings.activeTheme && settings.seasonalThemes) {
      const activeSeasonalTheme = settings.seasonalThemes.find(
        (theme) => theme.name.toLowerCase() === settings.activeTheme?.toLowerCase()
      )

      if (activeSeasonalTheme) {
        primaryColor = activeSeasonalTheme.primaryColor
        secondaryColor = activeSeasonalTheme.secondaryColor
        accentColor = activeSeasonalTheme.accentColor || activeSeasonalTheme.secondaryColor
        heroStyle = activeSeasonalTheme.heroStyle || heroStyle
        activeThemeName = activeSeasonalTheme.name
      }
    }

    return {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      primary_hsl: hexToHSL(primaryColor),
      secondary_hsl: hexToHSL(secondaryColor),
      accent_hsl: hexToHSL(accentColor),
      background_style: DEFAULT_THEME.background_style,
      hero_style: heroStyle,
      card_style: settings.cardStyle || DEFAULT_THEME.card_style,
      button_style: settings.buttonStyle || DEFAULT_THEME.button_style,
      animation_intensity: settings.animationIntensity || DEFAULT_THEME.animation_intensity,
      active_theme_name: activeThemeName,
    }
  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return DEFAULT_THEME
  }
}

/**
 * Get button radius class based on style setting
 */
export function getButtonRadiusClass(style: ButtonStyle): string {
  switch (style) {
    case 'pill':
      return 'rounded-full'
    case 'square':
      return 'rounded-none'
    case 'rounded':
    default:
      return 'rounded-lg'
  }
}

/**
 * Get card classes based on style setting
 */
export function getCardClasses(style: CardStyle): string {
  switch (style) {
    case 'border':
      return 'border-2 border-border shadow-none'
    case 'flat':
      return 'border-0 shadow-none bg-muted/50'
    case 'shadow':
    default:
      return 'border border-border shadow-sm hover:shadow-xl'
  }
}

/**
 * Check if animations should be enabled
 */
export function shouldAnimate(intensity: AnimationIntensity): boolean {
  return intensity !== 'none'
}

/**
 * Get animation duration multiplier
 */
export function getAnimationDuration(intensity: AnimationIntensity): number {
  switch (intensity) {
    case 'none':
      return 0
    case 'subtle':
      return 0.5
    case 'full':
    default:
      return 1
  }
}
