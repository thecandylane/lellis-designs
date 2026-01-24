import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
  plugins: [
    // Cloud storage for media files - required on Vercel (no local filesystem)
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : process.env.VERCEL
      ? (() => {
          console.error('⚠️ BLOB_READ_WRITE_TOKEN is required on Vercel for media uploads!')
          console.error('Add it in Vercel Dashboard → Settings → Environment Variables')
          return []
        })()
      : []),
  ],
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
      max: 10,                      // Maximum connections in pool
      min: 2,                       // Minimum idle connections
      idleTimeoutMillis: 30000,     // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout acquiring connection after 10s
    },
  }),
  sharp,
})
