import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp')
import path from 'path'
import { fileURLToPath } from 'url'

import {
  Users,
  Media,
  Categories,
  Buttons,
  Orders,
  CustomRequests,
  Ambassadors,
  ContactRequests,
} from './collections'
import { SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | L. Ellis Designs',
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Buttons,
    Orders,
    CustomRequests,
    Ambassadors,
    ContactRequests,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PAYLOAD_SECRET environment variable is required in production')
    }
    // Development-only fallback - NEVER use in production
    console.warn('⚠️  Using development PAYLOAD_SECRET - set PAYLOAD_SECRET env var for production')
    return 'dev-only-secret-do-not-use-in-production'
  })(),
  typescript: {
    outputFile: path.resolve(dirname, 'lib/types/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
})
