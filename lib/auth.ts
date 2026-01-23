import { cookies } from 'next/headers'
import { getPayload } from '@/lib/payload'

/**
 * Get the current user from Payload auth
 * Returns null if not authenticated
 */
export async function getUser() {
  const payload = await getPayload()
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) return null

  try {
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user
  } catch {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return !!user
}

/**
 * Check if payload-token cookie exists (for middleware)
 */
export function hasAuthCookie(request: Request): boolean {
  const cookie = request.headers.get('cookie')
  return !!cookie?.includes('payload-token=')
}
