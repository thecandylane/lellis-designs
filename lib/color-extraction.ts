import sharp from 'sharp'

type ColorResult = {
  dominantColor: string
  accentColor: string
}

/**
 * Convert RGB values to hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.round(c).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Calculate relative luminance of a color (for contrast checks)
 */
function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/**
 * Calculate color distance (Euclidean in RGB space)
 */
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  )
}

/**
 * Check if a color is too close to white or very light gray
 */
function isNearWhite(r: number, g: number, b: number): boolean {
  // Colors where all channels are > 240 are considered "near white"
  return r > 240 && g > 240 && b > 240
}

/**
 * Check if a color is too close to black or very dark gray
 */
function isNearBlack(r: number, g: number, b: number): boolean {
  // Colors where all channels are < 15 are considered "near black"
  return r < 15 && g < 15 && b < 15
}

/**
 * Check if a color is too gray (low saturation)
 */
function isGrayish(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  // If the difference between max and min is small relative to brightness, it's grayish
  return delta < 30
}

type ChannelStats = {
  mean: number
  stdev: number
  min: number
  max: number
}

/**
 * Extract dominant and accent colors from an image buffer using Sharp's stats
 */
export async function extractColorsFromBuffer(buffer: Buffer): Promise<ColorResult> {
  try {
    // First, flatten any transparency by compositing on white background
    // This handles PNG files with transparent backgrounds
    const flattenedBuffer = await sharp(buffer)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .resize(100, 100, { fit: 'cover' }) // Resize for faster processing
      .toBuffer()

    // Get image statistics
    const stats = await sharp(flattenedBuffer).stats()

    // Extract RGB channel statistics
    const channels = stats.channels as ChannelStats[]
    const rMean = channels[0].mean
    const gMean = channels[1].mean
    const bMean = channels[2].mean

    // The dominant color is the mean color
    let dominantR = rMean
    let dominantG = gMean
    let dominantB = bMean

    // If the mean is too neutral (gray/white/black), try to find a more vibrant color
    // by looking at the standard deviations and adjusting
    if (isNearWhite(dominantR, dominantG, dominantB) ||
        isNearBlack(dominantR, dominantG, dominantB) ||
        isGrayish(dominantR, dominantG, dominantB)) {
      // Use a histogram-based approach by sampling the image
      const { data, info } = await sharp(flattenedBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true })

      // Sample pixels and find the most vibrant non-neutral colors
      const colorCounts = new Map<string, { r: number; g: number; b: number; count: number }>()
      const pixelCount = info.width * info.height

      for (let i = 0; i < data.length; i += 3) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Skip near-white, near-black, and grayish pixels
        if (isNearWhite(r, g, b) || isNearBlack(r, g, b) || isGrayish(r, g, b)) {
          continue
        }

        // Quantize to reduce unique colors (group similar colors)
        const qr = Math.floor(r / 32) * 32
        const qg = Math.floor(g / 32) * 32
        const qb = Math.floor(b / 32) * 32
        const key = `${qr},${qg},${qb}`

        const existing = colorCounts.get(key)
        if (existing) {
          existing.count++
          // Accumulate actual colors for averaging
          existing.r += r
          existing.g += g
          existing.b += b
        } else {
          colorCounts.set(key, { r, g, b, count: 1 })
        }
      }

      // Find the most common non-neutral color
      let maxCount = 0
      let bestColor: { r: number; g: number; b: number } | null = null

      for (const [, value] of colorCounts) {
        if (value.count > maxCount) {
          maxCount = value.count
          // Average the accumulated colors
          bestColor = {
            r: value.r / value.count,
            g: value.g / value.count,
            b: value.b / value.count,
          }
        }
      }

      // Only use the found color if it represents a significant portion of the image
      if (bestColor && maxCount > pixelCount * 0.05) {
        dominantR = bestColor.r
        dominantG = bestColor.g
        dominantB = bestColor.b
      }
    }

    // For accent color, find a complementary or contrasting color
    // Start with a color that has different channel emphasis
    let accentR = dominantR
    let accentG = dominantG
    let accentB = dominantB

    // Use standard deviations to find where there's variation
    const rStd = channels[0].stdev
    const gStd = channels[1].stdev
    const bStd = channels[2].stdev

    // The channel with highest std deviation has the most variation
    // Adjust that channel to create contrast
    const maxStd = Math.max(rStd, gStd, bStd)
    if (maxStd > 30) { // Meaningful variation exists
      if (rStd === maxStd) {
        accentR = dominantR > 128 ? dominantR - 60 : dominantR + 60
      } else if (gStd === maxStd) {
        accentG = dominantG > 128 ? dominantG - 60 : dominantG + 60
      } else {
        accentB = dominantB > 128 ? dominantB - 60 : dominantB + 60
      }
    } else {
      // Not much variation, create a complementary-ish color by shifting hue
      // Simple approach: rotate the dominant channels
      const temp = accentR
      accentR = accentG
      accentG = accentB
      accentB = temp

      // If still too similar, darken or lighten
      if (colorDistance(dominantR, dominantG, dominantB, accentR, accentG, accentB) < 50) {
        const luminance = getLuminance(dominantR, dominantG, dominantB)
        if (luminance > 0.5) {
          // Darken
          accentR = Math.max(0, dominantR - 80)
          accentG = Math.max(0, dominantG - 80)
          accentB = Math.max(0, dominantB - 80)
        } else {
          // Lighten
          accentR = Math.min(255, dominantR + 80)
          accentG = Math.min(255, dominantG + 80)
          accentB = Math.min(255, dominantB + 80)
        }
      }
    }

    // Clamp values
    accentR = Math.max(0, Math.min(255, accentR))
    accentG = Math.max(0, Math.min(255, accentG))
    accentB = Math.max(0, Math.min(255, accentB))

    return {
      dominantColor: rgbToHex(dominantR, dominantG, dominantB),
      accentColor: rgbToHex(accentR, accentG, accentB),
    }
  } catch (error) {
    console.error('Error extracting colors:', error)
    // Return default colors on error
    return {
      dominantColor: '#14B8A6', // teal
      accentColor: '#EC4899',   // pink
    }
  }
}

/**
 * Extract colors from a file path
 */
export async function extractColorsFromPath(filePath: string): Promise<ColorResult> {
  const buffer = await sharp(filePath).toBuffer()
  return extractColorsFromBuffer(buffer)
}

/**
 * Extract colors from a URL (fetches the image first)
 */
export async function extractColorsFromUrl(url: string): Promise<ColorResult> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return extractColorsFromBuffer(buffer)
  } catch (error) {
    console.error('Error fetching image for color extraction:', error)
    return {
      dominantColor: '#14B8A6',
      accentColor: '#EC4899',
    }
  }
}
