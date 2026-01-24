import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

// Force Vercel build cache invalidation - 2024-01-24
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure resend is bundled correctly for serverless
  serverExternalPackages: ['resend'],
}

export default withPayload(nextConfig)
