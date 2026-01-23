/**
 * Reset admin password script
 * Usage: npx tsx scripts/reset-admin-password.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getPayload } from 'payload'
import config from '../payload.config'

async function resetAdminPassword() {
  const newPassword = 'admin123' // Change this to your desired password

  console.log('Connecting to Payload...')

  const payload = await getPayload({ config })

  // Find the first admin user
  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (users.length === 0) {
    console.log('No users found. Creating a new admin user...')

    const newUser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@lellisdesigns.com',
        password: newPassword,
        role: 'admin',
        name: 'Admin',
      },
    })

    console.log(`✅ Created new admin user: ${newUser.email}`)
    console.log(`   Password: ${newPassword}`)
  } else {
    const user = users[0]
    console.log(`Found user: ${user.email}`)

    // Update the password
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: newPassword,
      },
    })

    console.log(`✅ Password reset for: ${user.email}`)
    console.log(`   New password: ${newPassword}`)
  }

  console.log('\nYou can now log in at /admin')
  process.exit(0)
}

resetAdminPassword().catch((error) => {
  console.error('Error resetting password:', error)
  process.exit(1)
})
