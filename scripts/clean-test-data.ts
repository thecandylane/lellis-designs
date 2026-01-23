/**
 * Development Test Data Cleaner
 *
 * Removes all test data created by seed-test-data.ts
 * Identifies test data by the "[TEST]" prefix in names.
 *
 * Usage:
 *   pnpm tsx scripts/clean-test-data.ts
 *
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --force      Skip confirmation prompt
 */

import * as readline from 'readline'
import { getPayload } from 'payload'
import config from '../payload.config'

const TEST_PREFIX = '[TEST] '
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isForce = args.includes('--force')

async function confirm(message: string): Promise<boolean> {
  if (isForce) return true

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function main() {
  console.log('🧹 Test Data Cleaner')
  console.log('='.repeat(50))

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No data will be deleted\n')
  }

  const payload = await getPayload({ config })

  // Find all test buttons
  console.log('🔍 Searching for test buttons...')
  const testButtons = await payload.find({
    collection: 'buttons',
    where: {
      name: {
        contains: TEST_PREFIX,
      },
    },
    limit: 1000,
  })
  console.log(`   Found ${testButtons.docs.length} test buttons`)

  // Find all test categories
  console.log('🔍 Searching for test categories...')
  const testCategories = await payload.find({
    collection: 'categories',
    where: {
      name: {
        contains: TEST_PREFIX,
      },
    },
    limit: 1000,
  })
  console.log(`   Found ${testCategories.docs.length} test categories`)

  // Find all test media
  console.log('🔍 Searching for test media...')
  const testMedia = await payload.find({
    collection: 'media',
    where: {
      alt: {
        contains: TEST_PREFIX,
      },
    },
    limit: 1000,
  })
  console.log(`   Found ${testMedia.docs.length} test media files`)

  // Show what will be deleted
  console.log('\n📋 Items to delete:')
  console.log('─'.repeat(40))

  if (testButtons.docs.length > 0) {
    console.log('\n🔘 Buttons:')
    testButtons.docs.forEach((button) => {
      console.log(`   - ${button.name}`)
    })
  }

  if (testCategories.docs.length > 0) {
    console.log('\n📂 Categories:')
    testCategories.docs.forEach((category) => {
      console.log(`   - ${category.name}`)
    })
  }

  if (testMedia.docs.length > 0) {
    console.log('\n📷 Media:')
    testMedia.docs.forEach((media) => {
      console.log(`   - ${media.alt}`)
    })
  }

  const totalItems = testButtons.docs.length + testCategories.docs.length + testMedia.docs.length

  if (totalItems === 0) {
    console.log('\n✅ No test data found. Nothing to delete.')
    process.exit(0)
  }

  console.log('\n' + '─'.repeat(40))
  console.log(`Total: ${totalItems} items`)

  if (isDryRun) {
    console.log('\n🔍 DRY RUN complete. No data was deleted.')
    console.log('   Run without --dry-run to delete these items.')
    process.exit(0)
  }

  // Confirm deletion
  const shouldDelete = await confirm(
    `\n⚠️  Are you sure you want to delete ${totalItems} test items?`
  )

  if (!shouldDelete) {
    console.log('\n❌ Deletion cancelled.')
    process.exit(0)
  }

  // Delete buttons first (they reference categories)
  console.log('\n🗑️  Deleting buttons...')
  let deletedButtons = 0
  for (const button of testButtons.docs) {
    try {
      await payload.delete({
        collection: 'buttons',
        id: button.id as string,
      })
      deletedButtons++
      process.stdout.write(`\r   Deleted ${deletedButtons}/${testButtons.docs.length} buttons`)
    } catch (error) {
      console.error(`\n   ❌ Error deleting button ${button.id}:`, error)
    }
  }
  console.log(`\n   ✅ Deleted ${deletedButtons} buttons`)

  // Delete categories (children first, then parents)
  // Sort by depth (most nested first) based on parent relationships
  console.log('\n🗑️  Deleting categories...')

  // Build a map of category relationships
  const categoryMap = new Map(
    testCategories.docs.map((cat) => [cat.id, cat])
  )

  // Calculate depth for each category
  function getDepth(catId: string | number, visited = new Set<string | number>()): number {
    if (visited.has(catId)) return 0 // Prevent infinite loops
    visited.add(catId)

    const cat = categoryMap.get(catId)
    if (!cat || !cat.parent) return 0

    const parentId = typeof cat.parent === 'object' ? (cat.parent as { id: string }).id : cat.parent
    return 1 + getDepth(parentId, visited)
  }

  // Sort categories by depth (deepest first)
  const sortedCategories = [...testCategories.docs].sort((a, b) => {
    return getDepth(b.id as string) - getDepth(a.id as string)
  })

  let deletedCategories = 0
  for (const category of sortedCategories) {
    try {
      await payload.delete({
        collection: 'categories',
        id: category.id as string,
      })
      deletedCategories++
      process.stdout.write(
        `\r   Deleted ${deletedCategories}/${testCategories.docs.length} categories`
      )
    } catch (error) {
      console.error(`\n   ❌ Error deleting category ${category.id}:`, error)
    }
  }
  console.log(`\n   ✅ Deleted ${deletedCategories} categories`)

  // Delete media files (after buttons since buttons reference them)
  console.log('\n🗑️  Deleting media files...')
  let deletedMedia = 0
  for (const media of testMedia.docs) {
    try {
      await payload.delete({
        collection: 'media',
        id: media.id as string,
      })
      deletedMedia++
      process.stdout.write(`\r   Deleted ${deletedMedia}/${testMedia.docs.length} media files`)
    } catch (error) {
      console.error(`\n   ❌ Error deleting media ${media.id}:`, error)
    }
  }
  console.log(`\n   ✅ Deleted ${deletedMedia} media files`)

  // Clear seasonal themes from site settings
  console.log('\n🎨 Clearing test seasonal themes...')
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        seasonalThemes: [],
        activeTheme: '',
      },
    })
    console.log('   ✅ Cleared seasonal themes')
  } catch (error) {
    console.error('   ❌ Error clearing seasonal themes:', error)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ CLEANUP COMPLETE!')
  console.log('='.repeat(50))
  console.log(`🔘 Buttons deleted: ${deletedButtons}`)
  console.log(`📂 Categories deleted: ${deletedCategories}`)
  console.log(`📷 Media deleted: ${deletedMedia}`)
  console.log('\nThe database is now clean for production data.')

  process.exit(0)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
