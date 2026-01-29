import { getPayload } from '@/lib/payload'

type ComputedColors = {
  primary: string
  secondary: string
} | null

type ColorCount = {
  color: string
  count: number
  r: number
  g: number
  b: number
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate color distance (Euclidean in RGB space)
 */
function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  )
}

/**
 * Group similar colors together and return the most frequent groups
 * @param colors Array of hex color strings
 * @param threshold Distance threshold for grouping (0-441, where 441 is max distance)
 */
function groupSimilarColors(colors: string[], threshold: number = 60): ColorCount[] {
  const groups: ColorCount[] = []

  for (const hex of colors) {
    const rgb = hexToRgb(hex)
    if (!rgb) continue

    // Find existing group that's close enough
    let foundGroup = false
    for (const group of groups) {
      const dist = colorDistance(rgb, group)
      if (dist < threshold) {
        // Add to existing group (weighted average)
        const totalCount = group.count + 1
        group.r = (group.r * group.count + rgb.r) / totalCount
        group.g = (group.g * group.count + rgb.g) / totalCount
        group.b = (group.b * group.count + rgb.b) / totalCount
        group.count = totalCount
        // Update the hex color to the new average
        group.color = `#${Math.round(group.r).toString(16).padStart(2, '0')}${Math.round(group.g).toString(16).padStart(2, '0')}${Math.round(group.b).toString(16).padStart(2, '0')}`.toUpperCase()
        foundGroup = true
        break
      }
    }

    if (!foundGroup) {
      groups.push({
        color: hex.toUpperCase(),
        count: 1,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
      })
    }
  }

  // Sort by count descending
  return groups.sort((a, b) => b.count - a.count)
}

/**
 * Check if a color is too neutral (gray/white/black)
 */
function isNeutral(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  // Very low saturation (grayish)
  if (delta < 25) return true

  // Too light (near white)
  if (r > 235 && g > 235 && b > 235) return true

  // Too dark (near black)
  if (r < 20 && g < 20 && b < 20) return true

  return false
}

/**
 * Compute category colors by aggregating colors from buttons in the category
 * @param categoryId The category ID to compute colors for
 * @returns Computed primary and secondary colors, or null if not enough data
 */
export async function computeCategoryColors(categoryId: string): Promise<ComputedColors> {
  const payload = await getPayload()

  // Fetch buttons in this category with their media
  const { docs: buttons } = await payload.find({
    collection: 'buttons',
    where: {
      category: { equals: categoryId },
      active: { equals: true },
    },
    depth: 1, // Include related media
    limit: 50, // Limit to 50 buttons for performance
  })

  if (buttons.length === 0) {
    return null
  }

  // Collect dominant and accent colors from button images
  const dominantColors: string[] = []
  const accentColors: string[] = []

  for (const button of buttons) {
    const image = button.image as { dominantColor?: string; accentColor?: string } | undefined
    if (!image) continue

    if (image.dominantColor) {
      dominantColors.push(image.dominantColor)
    }
    if (image.accentColor) {
      accentColors.push(image.accentColor)
    }
  }

  // Need at least some colors to compute
  if (dominantColors.length === 0) {
    return null
  }

  // Group similar colors
  const dominantGroups = groupSimilarColors(dominantColors)
  const accentGroups = groupSimilarColors(accentColors)

  // Find the best primary color (most frequent non-neutral)
  let primaryColor: string | null = null
  for (const group of dominantGroups) {
    if (!isNeutral(group.r, group.g, group.b)) {
      primaryColor = group.color
      break
    }
  }

  // If no non-neutral primary found, use the most frequent anyway
  if (!primaryColor && dominantGroups.length > 0) {
    primaryColor = dominantGroups[0].color
  }

  if (!primaryColor) {
    return null
  }

  // Find the best secondary color (different from primary)
  let secondaryColor: string | null = null
  const primaryRgb = hexToRgb(primaryColor)

  // First try accent colors
  for (const group of accentGroups) {
    const rgb = { r: group.r, g: group.g, b: group.b }
    // Make sure it's sufficiently different from primary
    if (primaryRgb && colorDistance(primaryRgb, rgb) > 80) {
      if (!isNeutral(group.r, group.g, group.b)) {
        secondaryColor = group.color
        break
      }
    }
  }

  // If no good accent found, try finding a different dominant color
  if (!secondaryColor) {
    for (const group of dominantGroups) {
      if (group.color === primaryColor) continue
      const rgb = { r: group.r, g: group.g, b: group.b }
      if (primaryRgb && colorDistance(primaryRgb, rgb) > 80) {
        if (!isNeutral(group.r, group.g, group.b)) {
          secondaryColor = group.color
          break
        }
      }
    }
  }

  // If still no secondary, generate a complementary color
  if (!secondaryColor && primaryRgb) {
    // Create a complementary-ish color by rotating hue
    // Simple approach: shift the color
    const luminance = (0.299 * primaryRgb.r + 0.587 * primaryRgb.g + 0.114 * primaryRgb.b) / 255
    let r: number, g: number, b: number

    if (luminance > 0.5) {
      // Primary is light, make secondary darker
      r = Math.max(0, primaryRgb.r - 80)
      g = Math.max(0, primaryRgb.g - 80)
      b = Math.max(0, primaryRgb.b - 80)
    } else {
      // Primary is dark, make secondary lighter
      r = Math.min(255, primaryRgb.r + 80)
      g = Math.min(255, primaryRgb.g + 80)
      b = Math.min(255, primaryRgb.b + 80)
    }

    secondaryColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`.toUpperCase()
  }

  if (!secondaryColor) {
    return null
  }

  return {
    primary: primaryColor,
    secondary: secondaryColor,
  }
}

/**
 * Compute colors for multiple categories at once (more efficient)
 * @param categoryIds Array of category IDs
 * @returns Map of category ID to computed colors
 */
export async function computeCategoryColorsForMany(
  categoryIds: string[]
): Promise<Map<string, ComputedColors>> {
  const result = new Map<string, ComputedColors>()

  if (categoryIds.length === 0) {
    return result
  }

  const payload = await getPayload()

  // Fetch all buttons for all categories at once
  const { docs: buttons } = await payload.find({
    collection: 'buttons',
    where: {
      category: { in: categoryIds },
      active: { equals: true },
    },
    depth: 1,
    limit: 500,
  })

  // Group buttons by category
  const buttonsByCategory = new Map<string, typeof buttons>()
  for (const button of buttons) {
    const catId = typeof button.category === 'object' && button.category?.id
      ? String((button.category as { id: string | number }).id)
      : button.category
        ? String(button.category)
        : null

    if (!catId) continue

    if (!buttonsByCategory.has(catId)) {
      buttonsByCategory.set(catId, [])
    }
    buttonsByCategory.get(catId)!.push(button)
  }

  // Compute colors for each category
  for (const categoryId of categoryIds) {
    const categoryButtons = buttonsByCategory.get(categoryId) || []

    if (categoryButtons.length === 0) {
      result.set(categoryId, null)
      continue
    }

    // Collect colors
    const dominantColors: string[] = []
    const accentColors: string[] = []

    for (const button of categoryButtons) {
      const image = button.image as { dominantColor?: string; accentColor?: string } | undefined
      if (!image) continue

      if (image.dominantColor) {
        dominantColors.push(image.dominantColor)
      }
      if (image.accentColor) {
        accentColors.push(image.accentColor)
      }
    }

    if (dominantColors.length === 0) {
      result.set(categoryId, null)
      continue
    }

    // Group and find best colors (same logic as single category)
    const dominantGroups = groupSimilarColors(dominantColors)
    const accentGroups = groupSimilarColors(accentColors)

    let primaryColor: string | null = null
    for (const group of dominantGroups) {
      if (!isNeutral(group.r, group.g, group.b)) {
        primaryColor = group.color
        break
      }
    }

    if (!primaryColor && dominantGroups.length > 0) {
      primaryColor = dominantGroups[0].color
    }

    if (!primaryColor) {
      result.set(categoryId, null)
      continue
    }

    let secondaryColor: string | null = null
    const primaryRgb = hexToRgb(primaryColor)

    for (const group of accentGroups) {
      const rgb = { r: group.r, g: group.g, b: group.b }
      if (primaryRgb && colorDistance(primaryRgb, rgb) > 80 && !isNeutral(group.r, group.g, group.b)) {
        secondaryColor = group.color
        break
      }
    }

    if (!secondaryColor) {
      for (const group of dominantGroups) {
        if (group.color === primaryColor) continue
        const rgb = { r: group.r, g: group.g, b: group.b }
        if (primaryRgb && colorDistance(primaryRgb, rgb) > 80 && !isNeutral(group.r, group.g, group.b)) {
          secondaryColor = group.color
          break
        }
      }
    }

    if (!secondaryColor && primaryRgb) {
      const luminance = (0.299 * primaryRgb.r + 0.587 * primaryRgb.g + 0.114 * primaryRgb.b) / 255
      let r: number, g: number, b: number
      if (luminance > 0.5) {
        r = Math.max(0, primaryRgb.r - 80)
        g = Math.max(0, primaryRgb.g - 80)
        b = Math.max(0, primaryRgb.b - 80)
      } else {
        r = Math.min(255, primaryRgb.r + 80)
        g = Math.min(255, primaryRgb.g + 80)
        b = Math.min(255, primaryRgb.b + 80)
      }
      secondaryColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`.toUpperCase()
    }

    if (secondaryColor) {
      result.set(categoryId, { primary: primaryColor, secondary: secondaryColor })
    } else {
      result.set(categoryId, null)
    }
  }

  return result
}
