/**
 * Field whitelists for admin API endpoints
 * Prevents field injection attacks by explicitly defining allowed fields for updates
 */

/**
 * Allowed fields for button updates via admin API
 * Fields like internal IDs, timestamps, etc. are excluded
 */
export const BUTTON_ALLOWED_FIELDS = [
  'name',
  'description',
  'active',
  'featured',
  'price', // Optional per-button price override
  'category',
  'sortOrder',
  'image',
  'imageAlt',
] as const

export type ButtonAllowedField = typeof BUTTON_ALLOWED_FIELDS[number]

/**
 * Valid status values for contact requests
 */
export const CONTACT_REQUEST_ALLOWED_STATUS = [
  'new',
  'contacted',
  'resolved',
  'spam',
] as const

export type ContactRequestStatus = typeof CONTACT_REQUEST_ALLOWED_STATUS[number]

/**
 * Allowed fields for contact request updates via admin API
 */
export const CONTACT_REQUEST_ALLOWED_FIELDS = [
  'status',
  'adminNotes',
] as const

export type ContactRequestAllowedField = typeof CONTACT_REQUEST_ALLOWED_FIELDS[number]

/**
 * Valid order statuses
 */
export const ORDER_ALLOWED_STATUS = [
  'pending',
  'paid',
  'production',
  'ready',
  'shipped',
  'completed',
  'cancelled',
] as const

export type OrderStatus = typeof ORDER_ALLOWED_STATUS[number]

/**
 * Allowed fields for category updates via admin API
 */
export const CATEGORY_ALLOWED_FIELDS = [
  'name',
  'description',
  'active',
  'sortOrder',
  'parentCategory',
] as const

export type CategoryAllowedField = typeof CATEGORY_ALLOWED_FIELDS[number]

/**
 * Helper function to filter object to only include whitelisted fields
 */
export function filterToAllowedFields<T extends Record<string, unknown>>(
  data: T,
  allowedFields: readonly string[]
): Partial<T> {
  const filtered: Partial<T> = {}

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      filtered[key as keyof T] = value as T[keyof T]
    }
  }

  return filtered
}

/**
 * Validates that a status value is in the allowed list
 */
export function validateStatus<T extends readonly string[]>(
  status: unknown,
  allowedStatuses: T,
  fieldName = 'status'
): T[number] {
  if (typeof status !== 'string') {
    throw new Error(`${fieldName} must be a string`)
  }

  if (!(allowedStatuses as readonly string[]).includes(status)) {
    throw new Error(
      `Invalid ${fieldName}. Must be one of: ${allowedStatuses.join(', ')}`
    )
  }

  return status as T[number]
}
