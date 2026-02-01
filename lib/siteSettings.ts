import { getPayload } from '@/lib/payload'

export async function getSiteSettings() {
  const payload = await getPayload()
  return await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  })
}
