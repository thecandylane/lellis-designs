export type HeroStyle = 'ballpit' | 'gradient' | 'solid'
export type CardStyle = 'shadow' | 'border' | 'flat'
export type ButtonStyle = 'rounded' | 'pill' | 'square'
export type AnimationIntensity = 'none' | 'subtle' | 'full'
export type BackgroundStyle = 'clean' | 'geometric' | 'gradient'

export type SeasonalTheme = {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  heroStyle?: HeroStyle
  description?: string
}

export type ThemeSettings = {
  primary_color: string      // Hex (e.g., "#14B8A6")
  secondary_color: string    // Hex
  accent_color: string       // Hex (optional third color)
  primary_hsl: string        // HSL without hsl() (e.g., "172 77% 40%")
  secondary_hsl: string      // HSL
  accent_hsl: string         // HSL
  background_style: BackgroundStyle
  hero_style: HeroStyle
  card_style: CardStyle
  button_style: ButtonStyle
  animation_intensity: AnimationIntensity
  active_theme_name?: string // Name of active seasonal theme (if any)
}

export const DEFAULT_THEME: ThemeSettings = {
  primary_color: '#14B8A6',
  secondary_color: '#EC4899',
  accent_color: '#84CC16',
  primary_hsl: '172 77% 40%',
  secondary_hsl: '330 81% 60%',
  accent_hsl: '84 81% 44%',
  background_style: 'geometric',
  hero_style: 'ballpit',
  card_style: 'shadow',
  button_style: 'rounded',
  animation_intensity: 'full',
}

// Preset themes for quick setup
export const PRESET_THEMES: SeasonalTheme[] = [
  {
    name: 'Christmas',
    primaryColor: '#DC2626',
    secondaryColor: '#16A34A',
    accentColor: '#FCD34D',
    heroStyle: 'gradient',
    description: 'Perfect for the holiday season (November - December)',
  },
  {
    name: 'Mardi Gras',
    primaryColor: '#7C3AED',
    secondaryColor: '#FCD34D',
    accentColor: '#16A34A',
    heroStyle: 'ballpit',
    description: 'Celebrate Mardi Gras season in Louisiana!',
  },
  {
    name: 'LSU Game Day',
    primaryColor: '#461D7C',
    secondaryColor: '#FDD023',
    accentColor: '#FDD023',
    heroStyle: 'ballpit',
    description: 'Geaux Tigers! Perfect for football season',
  },
  {
    name: 'Ole Miss',
    primaryColor: '#CE1126',
    secondaryColor: '#14213D',
    accentColor: '#CE1126',
    heroStyle: 'gradient',
    description: 'Hotty Toddy!',
  },
  {
    name: 'Valentines',
    primaryColor: '#EC4899',
    secondaryColor: '#DC2626',
    accentColor: '#FDF2F8',
    heroStyle: 'gradient',
    description: 'Love is in the air (February)',
  },
  {
    name: 'Halloween',
    primaryColor: '#F97316',
    secondaryColor: '#1F2937',
    accentColor: '#7C3AED',
    heroStyle: 'solid',
    description: 'Spooky season (October)',
  },
  {
    name: 'Spring',
    primaryColor: '#10B981',
    secondaryColor: '#F472B6',
    accentColor: '#FCD34D',
    heroStyle: 'ballpit',
    description: 'Fresh spring colors (March - May)',
  },
  {
    name: 'Summer',
    primaryColor: '#0EA5E9',
    secondaryColor: '#FBBF24',
    accentColor: '#F97316',
    heroStyle: 'gradient',
    description: 'Bright summer vibes (June - August)',
  },
]
