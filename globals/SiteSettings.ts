import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true, // Public read for theme settings
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand Colors',
          description: 'Default brand colors (used when no seasonal theme is active)',
          fields: [
            {
              name: 'primaryColor',
              type: 'text',
              defaultValue: '#14B8A6',
              admin: {
                description: 'Primary brand color (hex, e.g., #14B8A6 teal)',
              },
            },
            {
              name: 'secondaryColor',
              type: 'text',
              defaultValue: '#EC4899',
              admin: {
                description: 'Secondary brand color (hex, e.g., #EC4899 pink)',
              },
            },
            {
              name: 'accentColor',
              type: 'text',
              defaultValue: '#84CC16',
              admin: {
                description: 'Accent color for highlights (hex, e.g., #84CC16 lime)',
              },
            },
          ],
        },
        {
          label: 'Seasonal Themes',
          description: 'Create and manage seasonal color themes',
          fields: [
            {
              name: 'activeTheme',
              type: 'text',
              admin: {
                description: 'Enter the name of the theme to activate (leave empty to use default brand colors)',
              },
            },
            {
              name: 'seasonalThemes',
              type: 'array',
              admin: {
                description: 'Create custom seasonal themes that can be activated anytime',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Theme name (e.g., "Christmas", "Mardi Gras", "LSU Game Day")',
                  },
                },
                {
                  name: 'primaryColor',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Primary color for this theme (hex)',
                  },
                },
                {
                  name: 'secondaryColor',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Secondary color for this theme (hex)',
                  },
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  admin: {
                    description: 'Accent color (optional, defaults to secondary)',
                  },
                },
                {
                  name: 'heroStyle',
                  type: 'select',
                  defaultValue: 'ballpit',
                  options: [
                    { label: 'Ballpit (3D Animation)', value: 'ballpit' },
                    { label: 'Gradient', value: 'gradient' },
                    { label: 'Solid Color', value: 'solid' },
                  ],
                  admin: {
                    description: 'Hero section background style',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description: 'Optional notes about when to use this theme',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Appearance',
          description: 'Additional visual customization options',
          fields: [
            {
              name: 'heroStyle',
              type: 'select',
              defaultValue: 'ballpit',
              options: [
                { label: 'Ballpit (3D Animation)', value: 'ballpit' },
                { label: 'Gradient', value: 'gradient' },
                { label: 'Solid Color', value: 'solid' },
              ],
              admin: {
                description: 'Default hero section background style',
              },
            },
            {
              name: 'cardStyle',
              type: 'select',
              defaultValue: 'shadow',
              options: [
                { label: 'Shadow', value: 'shadow' },
                { label: 'Border', value: 'border' },
                { label: 'Flat', value: 'flat' },
              ],
              admin: {
                description: 'Product and category card style',
              },
            },
            {
              name: 'buttonStyle',
              type: 'select',
              defaultValue: 'rounded',
              options: [
                { label: 'Rounded', value: 'rounded' },
                { label: 'Pill', value: 'pill' },
                { label: 'Square', value: 'square' },
              ],
              admin: {
                description: 'Button corner style throughout the site',
              },
            },
            {
              name: 'animationIntensity',
              type: 'select',
              defaultValue: 'full',
              options: [
                { label: 'None (Accessibility)', value: 'none' },
                { label: 'Subtle', value: 'subtle' },
                { label: 'Full', value: 'full' },
              ],
              admin: {
                description: 'Control animation intensity site-wide',
              },
            },
          ],
        },
        {
          label: 'Business Info',
          fields: [
            {
              name: 'businessName',
              type: 'text',
              defaultValue: 'L. Ellis Designs',
            },
            {
              name: 'tagline',
              type: 'text',
              defaultValue: 'Custom 3" Buttons for Every Occasion',
            },
            {
              name: 'pickupAddress',
              type: 'textarea',
              admin: {
                description: 'Pickup address revealed when order is ready',
              },
            },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              name: 'singlePrice',
              type: 'number',
              defaultValue: 5,
              admin: {
                description: 'Price per single button (under 100 quantity)',
              },
            },
            {
              name: 'tier1Price',
              type: 'number',
              defaultValue: 4.5,
              admin: {
                description: 'Price per button for 100-199 quantity',
              },
            },
            {
              name: 'tier1Threshold',
              type: 'number',
              defaultValue: 100,
              admin: {
                description: 'Minimum quantity for tier 1 pricing',
              },
            },
            {
              name: 'tier2Price',
              type: 'number',
              defaultValue: 4,
              admin: {
                description: 'Price per button for 200+ quantity',
              },
            },
            {
              name: 'tier2Threshold',
              type: 'number',
              defaultValue: 200,
              admin: {
                description: 'Minimum quantity for tier 2 pricing',
              },
            },
            {
              name: 'shippingCost',
              type: 'number',
              defaultValue: 8,
              admin: {
                description: 'Flat rate UPS shipping cost',
              },
            },
          ],
        },
      ],
    },
  ],
}
