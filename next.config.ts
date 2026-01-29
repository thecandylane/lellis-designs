import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

// Force Vercel build cache invalidation - 2024-01-24
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Vercel Blob Storage - specific pattern instead of wildcard
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Add other trusted domains here as needed
      // Example:
      // { protocol: 'https', hostname: 'cdn.yourdomain.com' },
    ],
  },
  // Ensure resend is bundled correctly for serverless
  serverExternalPackages: ['resend'],
}

export default withPayload(nextConfig)
