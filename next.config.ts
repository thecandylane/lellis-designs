import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

// Force Vercel build cache invalidation - 2024-01-23
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default withPayload(nextConfig)
