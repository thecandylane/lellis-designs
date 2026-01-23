import { getPayload as getPayloadInstance } from 'payload'
import config from '@payload-config'

// Cached payload instance for server-side usage
let cachedPayload: Awaited<ReturnType<typeof getPayloadInstance>> | null = null

/**
 * Get the Payload CMS instance.
 * Uses caching to avoid re-initializing on every request.
 */
export async function getPayload() {
  if (cachedPayload) {
    return cachedPayload
  }

  cachedPayload = await getPayloadInstance({ config })
  return cachedPayload
}

/**
 * Helper to get media URL from a Payload media object or ID
 */
export function getMediaUrl(
  media: { url?: string | null } | string | null | undefined
): string | null {
  if (!media) return null
  if (typeof media === 'string') return null // ID only, need to fetch
  return media.url || null
}

/**
 * Helper to get a specific image size URL
 */
export function getMediaSizeUrl(
  media: { sizes?: Record<string, { url?: string | null }> } | string | null | undefined,
  size: 'thumbnail' | 'card' | 'full'
): string | null {
  if (!media || typeof media === 'string') return null
  return media.sizes?.[size]?.url || null
}
