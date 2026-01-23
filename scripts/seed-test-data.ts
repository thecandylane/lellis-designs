/**
 * Development Test Data Seeder
 *
 * Creates test categories and buttons to help design the site layout.
 * All test data is prefixed with [TEST] for easy identification and deletion.
 *
 * Usage:
 *   pnpm tsx scripts/seed-test-data.ts
 *
 * To delete test data:
 *   pnpm tsx scripts/clean-test-data.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'

// Test data prefix - makes it easy to identify and delete
const TEST_PREFIX = '[TEST] '

// Placeholder image configurations
const PLACEHOLDER_IMAGES: Record<string, { bg: string; fg: string; text: string }> = {
  lsu: { bg: '461D7C', fg: 'FDD023', text: 'LSU' },
  oleMiss: { bg: 'CE1126', fg: '14213D', text: 'Ole+Miss' },
  catholicHigh: { bg: '1E3A8A', fg: 'FFFFFF', text: 'CHS' },
  stjoseph: { bg: 'DC2626', fg: 'FFFFFF', text: 'SJA' },
  dunham: { bg: '059669', fg: 'FFFFFF', text: 'Dunham' },
  mardiGras: { bg: '7C3AED', fg: 'FCD34D', text: 'MG' },
  generic: { bg: '14B8A6', fg: 'FFFFFF', text: 'Button' },
  football: { bg: '78350F', fg: 'FBBF24', text: 'FB' },
  cheer: { bg: 'EC4899', fg: 'FFFFFF', text: 'Cheer' },
  greek: { bg: '6366F1', fg: 'FFFFFF', text: 'Greek' },
  tulane: { bg: '00594C', fg: '0EA5E9', text: 'Tulane' },
  christmas: { bg: 'DC2626', fg: '16A34A', text: 'Xmas' },
  graduation: { bg: '1F2937', fg: 'FCD34D', text: 'Grad' },
}

// Cache for uploaded media IDs to avoid re-uploading
const mediaCache: Map<string, string> = new Map()

/**
 * Download an image from URL and return as Buffer
 */
function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve).catch(reject)
          return
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

/**
 * Create or get cached media for a placeholder image key
 */
async function getOrCreateMedia(
  payload: Payload,
  imageKey: string
): Promise<string> {
  // Check cache first
  if (mediaCache.has(imageKey)) {
    return mediaCache.get(imageKey)!
  }

  const imgConfig = PLACEHOLDER_IMAGES[imageKey] || PLACEHOLDER_IMAGES.generic
  const url = `https://placehold.co/400x400/${imgConfig.bg}/${imgConfig.fg}/png?text=${imgConfig.text}`

  console.log(`    📷 Downloading placeholder: ${imageKey}`)

  try {
    const imageBuffer = await downloadImage(url)

    // Create a temporary file path
    const tempDir = path.join(process.cwd(), 'public', 'media')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    const tempFilePath = path.join(tempDir, `test-${imageKey}-${Date.now()}.png`)

    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, imageBuffer)

    // Create media document using file upload
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `${TEST_PREFIX}${imgConfig.text} placeholder`,
      },
      file: {
        data: imageBuffer,
        mimetype: 'image/png',
        name: `test-${imageKey}.png`,
        size: imageBuffer.length,
      },
    })

    const mediaId = String(media.id)
    console.log(`    ✅ Created media: ${mediaId}`)
    mediaCache.set(imageKey, mediaId)

    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath)
    } catch {
      // Ignore cleanup errors
    }

    return mediaId
  } catch (error) {
    console.error(`    ❌ Failed to create media for ${imageKey}:`, error)
    throw error
  }
}

// Category structure with colors
type CategorySeed = {
  name: string
  slug: string
  colorPrimary?: string
  colorSecondary?: string
  children?: CategorySeed[]
}

const CATEGORY_STRUCTURE: CategorySeed[] = [
  {
    name: 'Baton Rouge',
    slug: 'baton-rouge',
    colorPrimary: '#14B8A6', // Teal
    colorSecondary: '#EC4899', // Pink
    children: [
      {
        name: 'LSU',
        slug: 'lsu',
        colorPrimary: '#461D7C', // LSU Purple
        colorSecondary: '#FDD023', // LSU Gold
        children: [
          { name: 'Football', slug: 'football' },
          { name: 'Baseball', slug: 'baseball' },
          { name: 'Gymnastics', slug: 'gymnastics' },
          { name: 'Greek Life', slug: 'greek-life', children: [
            { name: 'Chi Omega', slug: 'chi-omega', colorPrimary: '#DC2626', colorSecondary: '#FCD34D' },
            { name: 'Phi Mu', slug: 'phi-mu', colorPrimary: '#EC4899', colorSecondary: '#FFFFFF' },
            { name: 'Kappa Delta', slug: 'kappa-delta', colorPrimary: '#16A34A', colorSecondary: '#FFFFFF' },
          ]},
          { name: 'Alumni', slug: 'alumni' },
        ],
      },
      {
        name: 'High Schools',
        slug: 'high-schools',
        colorPrimary: '#0EA5E9', // Sky blue
        colorSecondary: '#F97316', // Orange
        children: [
          { name: 'Catholic High', slug: 'catholic-high', colorPrimary: '#1E3A8A', colorSecondary: '#FFFFFF' },
          { name: "St. Joseph's Academy", slug: 'st-josephs', colorPrimary: '#DC2626', colorSecondary: '#FFFFFF' },
          { name: 'Dunham School', slug: 'dunham', colorPrimary: '#059669', colorSecondary: '#FFFFFF' },
          { name: 'Episcopal', slug: 'episcopal', colorPrimary: '#7C3AED', colorSecondary: '#FCD34D' },
          { name: 'Baton Rouge High', slug: 'br-high', colorPrimary: '#DC2626', colorSecondary: '#1F2937' },
        ],
      },
      {
        name: 'Events',
        slug: 'events',
        colorPrimary: '#7C3AED', // Purple
        colorSecondary: '#FCD34D', // Gold
        children: [
          { name: 'Mardi Gras', slug: 'mardi-gras', colorPrimary: '#7C3AED', colorSecondary: '#FCD34D' },
          { name: 'Christmas', slug: 'christmas', colorPrimary: '#DC2626', colorSecondary: '#16A34A' },
          { name: 'Graduation', slug: 'graduation', colorPrimary: '#1F2937', colorSecondary: '#FCD34D' },
        ],
      },
    ],
  },
  {
    name: 'Oxford',
    slug: 'oxford',
    colorPrimary: '#CE1126', // Ole Miss Red
    colorSecondary: '#14213D', // Ole Miss Navy
    children: [
      {
        name: 'Ole Miss',
        slug: 'ole-miss',
        colorPrimary: '#CE1126',
        colorSecondary: '#14213D',
        children: [
          { name: 'Football', slug: 'football' },
          { name: 'Baseball', slug: 'baseball' },
          { name: 'Greek Life', slug: 'greek-life', children: [
            { name: 'Chi Omega', slug: 'chi-omega', colorPrimary: '#DC2626', colorSecondary: '#FCD34D' },
            { name: 'Kappa Kappa Gamma', slug: 'kappa-kappa-gamma', colorPrimary: '#0EA5E9', colorSecondary: '#FFFFFF' },
          ]},
        ],
      },
    ],
  },
  {
    name: 'New Orleans',
    slug: 'new-orleans',
    colorPrimary: '#7C3AED', // Purple (Mardi Gras vibe)
    colorSecondary: '#FCD34D', // Gold
    children: [
      {
        name: 'Tulane',
        slug: 'tulane',
        colorPrimary: '#00594C', // Tulane Green
        colorSecondary: '#0EA5E9', // Blue
        children: [
          { name: 'Football', slug: 'football' },
          { name: 'Greek Life', slug: 'greek-life' },
        ],
      },
      {
        name: 'Events',
        slug: 'events',
        children: [
          { name: 'Mardi Gras', slug: 'mardi-gras', colorPrimary: '#7C3AED', colorSecondary: '#FCD34D' },
          { name: 'Jazz Fest', slug: 'jazz-fest', colorPrimary: '#F97316', colorSecondary: '#7C3AED' },
        ],
      },
    ],
  },
]

// Sample buttons to create for each category type
type ButtonSeed = {
  nameTemplate: string
  priceVariant?: number
  customization: 'as_is' | 'customizable'
  featured?: boolean
}

const BUTTON_TEMPLATES: Record<string, ButtonSeed[]> = {
  // For sports categories
  football: [
    { nameTemplate: '{team} Game Day', customization: 'as_is', featured: true },
    { nameTemplate: '{team} Tailgate', customization: 'as_is' },
    { nameTemplate: '{team} Mom', customization: 'customizable' },
    { nameTemplate: '{team} Dad', customization: 'customizable' },
    { nameTemplate: '{team} #1 Fan', customization: 'as_is' },
    { nameTemplate: 'Custom {team} Jersey Number', customization: 'customizable' },
  ],
  baseball: [
    { nameTemplate: '{team} Baseball', customization: 'as_is' },
    { nameTemplate: '{team} Baseball Mom', customization: 'customizable' },
  ],
  gymnastics: [
    { nameTemplate: '{team} Gymnastics', customization: 'as_is', featured: true },
    { nameTemplate: '{team} Gym Mom', customization: 'customizable' },
  ],
  // For Greek life
  'greek-life': [
    { nameTemplate: '{org} Letters', customization: 'as_is', featured: true },
    { nameTemplate: '{org} Big/Little', customization: 'customizable' },
    { nameTemplate: '{org} Bid Day', customization: 'as_is' },
    { nameTemplate: '{org} Formal', customization: 'customizable' },
  ],
  // For sorority chapters
  sorority: [
    { nameTemplate: '{chapter} Letters', customization: 'as_is', featured: true },
    { nameTemplate: '{chapter} Big', customization: 'customizable' },
    { nameTemplate: '{chapter} Little', customization: 'customizable' },
    { nameTemplate: '{chapter} Bid Day 2025', customization: 'as_is' },
  ],
  // For high schools
  highschool: [
    { nameTemplate: '{school} Pride', customization: 'as_is', featured: true },
    { nameTemplate: '{school} Class of 2025', customization: 'as_is' },
    { nameTemplate: '{school} Senior', customization: 'customizable' },
    { nameTemplate: '{school} Mom', customization: 'customizable' },
    { nameTemplate: '{school} Cheer', customization: 'as_is' },
    { nameTemplate: '{school} Football', customization: 'as_is' },
  ],
  // For events
  event: [
    { nameTemplate: '{event} 2025', customization: 'as_is', featured: true },
    { nameTemplate: '{event} Krewe', customization: 'customizable' },
    { nameTemplate: 'Happy {event}', customization: 'as_is' },
  ],
  // Generic/alumni
  generic: [
    { nameTemplate: '{name} Pride', customization: 'as_is' },
    { nameTemplate: '{name} Alumni', customization: 'as_is' },
    { nameTemplate: 'Custom {name}', customization: 'customizable' },
  ],
}

async function main() {
  console.log('🌱 Starting test data seeding...\n')

  const payload = await getPayload({ config })

  // Track created IDs for reference
  const createdCategories: Map<string, string> = new Map()
  const createdButtons: string[] = []

  // We'll create media items on-demand as we create buttons
  console.log('📁 Media will be created from placeholder images\n')

  // Recursive function to create categories
  async function createCategory(
    cat: CategorySeed,
    parentId: string | number | null,
    pathPrefix: string
  ): Promise<void> {
    const fullPath = pathPrefix ? `${pathPrefix}/${cat.slug}` : cat.slug
    const fullName = `${TEST_PREFIX}${cat.name}`

    console.log(`📂 Creating category: ${fullName}`)

    try {
      // Build data object, only including parent if it exists
      const categoryData: Record<string, unknown> = {
        name: fullName,
        slug: cat.slug,
        active: true,
        sortOrder: 0,
      }
      if (parentId) {
        categoryData.parent = parentId
      }
      if (cat.colorPrimary) {
        categoryData.colorPrimary = cat.colorPrimary
      }
      if (cat.colorSecondary) {
        categoryData.colorSecondary = cat.colorSecondary
      }

      const created = await payload.create({
        collection: 'categories',
        data: categoryData,
      })

      const createdId = created.id
      createdCategories.set(fullPath, String(createdId))

      // Create buttons for this category based on its type
      await createButtonsForCategory(createdId, cat, fullPath)

      // Recursively create children
      if (cat.children) {
        for (const child of cat.children) {
          await createCategory(child, createdId, fullPath)
        }
      }
    } catch (error) {
      console.error(`  ❌ Error creating category ${fullName}:`, error)
    }
  }

  // Function to create buttons for a category
  async function createButtonsForCategory(
    categoryId: string | number,
    cat: CategorySeed,
    catPath: string
  ): Promise<void> {
    // Determine which button templates to use
    let templates: ButtonSeed[] = []
    let contextName = cat.name

    // Match category type to templates
    if (cat.slug === 'football') {
      templates = BUTTON_TEMPLATES.football
      // Get parent name for team
      const pathParts = catPath.split('/')
      contextName = pathParts[pathParts.length - 2] || cat.name
    } else if (cat.slug === 'baseball') {
      templates = BUTTON_TEMPLATES.baseball
      const pathParts = catPath.split('/')
      contextName = pathParts[pathParts.length - 2] || cat.name
    } else if (cat.slug === 'gymnastics') {
      templates = BUTTON_TEMPLATES.gymnastics
      const pathParts = catPath.split('/')
      contextName = pathParts[pathParts.length - 2] || cat.name
    } else if (cat.slug === 'greek-life') {
      templates = BUTTON_TEMPLATES['greek-life']
      const pathParts = catPath.split('/')
      contextName = pathParts[pathParts.length - 2] || cat.name
    } else if (['chi-omega', 'phi-mu', 'kappa-delta', 'kappa-kappa-gamma'].includes(cat.slug)) {
      templates = BUTTON_TEMPLATES.sorority
      contextName = cat.name
    } else if (catPath.includes('high-schools') && !cat.children) {
      templates = BUTTON_TEMPLATES.highschool
      contextName = cat.name.replace("'s Academy", '').replace(' School', '')
    } else if (catPath.includes('events') && !cat.children) {
      templates = BUTTON_TEMPLATES.event
      contextName = cat.name
    } else if (!cat.children) {
      // Leaf category without specific template
      templates = BUTTON_TEMPLATES.generic
    }

    // Create buttons from templates
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const buttonName = template.nameTemplate
        .replace('{team}', contextName)
        .replace('{org}', contextName)
        .replace('{chapter}', contextName)
        .replace('{school}', contextName)
        .replace('{event}', contextName)
        .replace('{name}', contextName)

      const fullName = `${TEST_PREFIX}${buttonName}`

      // Pick a placeholder image key based on context
      let imageKey = 'generic'
      if (catPath.includes('lsu')) imageKey = 'lsu'
      else if (catPath.includes('ole-miss')) imageKey = 'oleMiss'
      else if (catPath.includes('catholic-high')) imageKey = 'catholicHigh'
      else if (catPath.includes('st-joseph')) imageKey = 'stjoseph'
      else if (catPath.includes('dunham')) imageKey = 'dunham'
      else if (catPath.includes('mardi-gras')) imageKey = 'mardiGras'
      else if (catPath.includes('tulane')) imageKey = 'tulane'
      else if (cat.slug === 'football') imageKey = 'football'
      else if (catPath.includes('greek')) imageKey = 'greek'
      else if (catPath.includes('cheer')) imageKey = 'cheer'
      else if (catPath.includes('christmas')) imageKey = 'christmas'
      else if (catPath.includes('graduation')) imageKey = 'graduation'

      try {
        // Get or create media for this image
        const mediaId = await getOrCreateMedia(payload, imageKey)

        const created = await payload.create({
          collection: 'buttons',
          data: {
            name: fullName,
            description: `Test button for ${contextName}`,
            image: mediaId,
            category: categoryId,
            price: 5,
            leadTimeDays: 7,
            customization: template.customization,
            active: true,
            featured: template.featured || false,
          },
        })

        createdButtons.push(String(created.id))
        console.log(`    🔘 Created button: ${buttonName}${template.featured ? ' ⭐' : ''}`)
      } catch (error) {
        console.error(`    ❌ Error creating button ${fullName}:`, error)
      }
    }
  }

  // Create all root categories and their children
  for (const rootCat of CATEGORY_STRUCTURE) {
    await createCategory(rootCat, null, '')
  }

  // Also create some seasonal themes for testing
  console.log('\n🎨 Adding seasonal themes to site settings...')
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        seasonalThemes: [
          {
            name: 'LSU Game Day',
            primaryColor: '#461D7C',
            secondaryColor: '#FDD023',
            accentColor: '#FDD023',
            heroStyle: 'ballpit',
            description: 'Geaux Tigers! Purple and gold for game days.',
          },
          {
            name: 'Mardi Gras',
            primaryColor: '#7C3AED',
            secondaryColor: '#FCD34D',
            accentColor: '#16A34A',
            heroStyle: 'ballpit',
            description: 'Purple, gold, and green for carnival season!',
          },
          {
            name: 'Christmas',
            primaryColor: '#DC2626',
            secondaryColor: '#16A34A',
            accentColor: '#FCD34D',
            heroStyle: 'gradient',
            description: 'Festive red and green for the holidays.',
          },
        ],
        // Don't activate any theme by default
        activeTheme: '',
      },
    })
    console.log('  ✅ Added 3 seasonal themes (LSU Game Day, Mardi Gras, Christmas)')
  } catch (error) {
    console.error('  ❌ Error adding seasonal themes:', error)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ SEEDING COMPLETE!')
  console.log('='.repeat(50))
  console.log(`📂 Categories created: ${createdCategories.size}`)
  console.log(`🔘 Buttons created: ${createdButtons.length}`)
  console.log('\nTo delete all test data, run:')
  console.log('  pnpm tsx scripts/clean-test-data.ts')
  console.log('\nAll test items are prefixed with "[TEST]" for easy identification.')

  process.exit(0)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
