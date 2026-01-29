/**
 * Security utilities for the application
 * Provides validation, sanitization, and rate limiting functions
 */

// HTML Escaping for XSS Prevention
export function escapeHtml(unsafe: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return unsafe.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char)
}

// File Upload Validation
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File):
  { valid: true } | { valid: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid type. Allowed: PNG, JPEG, WebP. You uploaded: ${file.type}`
    }
  }
  return { valid: true }
}

// Safe JSON Parsing
export function safeJsonParse<T>(jsonString: string, fieldName = 'data'): T {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    throw new Error(`Invalid JSON format for ${fieldName}`)
  }
}

// Numeric Validation
export function validatePositiveNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number } = {}
): number {
  const num = Number(value)
  if (isNaN(num)) throw new Error(`${fieldName} must be a valid number`)
  if (num < 0) throw new Error(`${fieldName} must be positive`)
  if (options.min !== undefined && num < options.min) {
    throw new Error(`${fieldName} must be at least ${options.min}`)
  }
  if (options.max !== undefined && num > options.max) {
    throw new Error(`${fieldName} must be at most ${options.max}`)
  }
  return num
}

// String Length Validation
export function validateStringLength(
  value: unknown,
  fieldName: string,
  maxLength: number,
  required = false
): string {
  if (typeof value !== 'string') {
    if (required) throw new Error(`${fieldName} is required`)
    return ''
  }
  if (required && !value.trim()) {
    throw new Error(`${fieldName} cannot be empty`)
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds max length of ${maxLength}`)
  }
  return value
}

// Rate Limiting
type RateLimitEntry = { count: number; resetAt: number }

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()

  constructor(
    private requestsPerWindow = 5,
    private windowMs = 60000
  ) {
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60000)
  }

  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []
    this.store.forEach((entry, key) => {
      if (entry.resetAt < now) keysToDelete.push(key)
    })
    keysToDelete.forEach((key) => this.store.delete(key))
  }

  check(identifier: string):
    { allowed: boolean; resetAt: number; remaining: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || entry.resetAt < now) {
      const resetAt = now + this.windowMs
      this.store.set(identifier, { count: 1, resetAt })
      return { allowed: true, resetAt, remaining: this.requestsPerWindow - 1 }
    }

    if (entry.count >= this.requestsPerWindow) {
      return { allowed: false, resetAt: entry.resetAt, remaining: 0 }
    }

    entry.count++
    return {
      allowed: true,
      resetAt: entry.resetAt,
      remaining: this.requestsPerWindow - entry.count
    }
  }
}

export const contactRateLimiter = new RateLimiter(5, 60000)
export const customRequestRateLimiter = new RateLimiter(3, 60000)
export const checkoutRateLimiter = new RateLimiter(10, 60000)

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export function checkRateLimit(request: Request, limiter: RateLimiter):
  { allowed: true } | { allowed: false; error: string; retryAfter: number } {
  const ip = getClientIp(request)
  const result = limiter.check(ip)

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000)
    return {
      allowed: false,
      error: `Too many requests. Try again in ${retryAfterSeconds}s.`,
      retryAfter: retryAfterSeconds,
    }
  }
  return { allowed: true }
}
