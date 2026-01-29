/**
 * Application-wide constants
 * Shared values used across multiple files to maintain consistency
 */

// ===================================
// Order Status Constants
// ===================================

export const VALID_ORDER_STATUSES = [
  'pending',
  'paid',
  'production',
  'ready',
  'shipped',
  'completed',
  'cancelled',
] as const

export type OrderStatus = typeof VALID_ORDER_STATUSES[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  production: { label: 'In Production', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready for Pickup', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

// ===================================
// Custom Request Status Constants
// ===================================

export const VALID_CUSTOM_REQUEST_STATUSES = [
  'new',
  'contacted',
  'quoted',
  'approved',
  'production',
  'completed',
  'declined',
] as const

export type CustomRequestStatus = typeof VALID_CUSTOM_REQUEST_STATUSES[number]

export const CUSTOM_REQUEST_STATUS_LABELS: Record<CustomRequestStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  quoted: { label: 'Quoted', color: 'bg-purple-100 text-purple-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  production: { label: 'In Production', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
}

// ===================================
// Contact Request Status Constants
// ===================================

export const VALID_CONTACT_REQUEST_STATUSES = [
  'new',
  'contacted',
  'resolved',
  'spam',
] as const

export type ContactRequestStatus = typeof VALID_CONTACT_REQUEST_STATUSES[number]

export const CONTACT_REQUEST_STATUS_LABELS: Record<ContactRequestStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  spam: { label: 'Spam', color: 'bg-red-100 text-red-800' },
}

// ===================================
// Shipping Method Constants
// ===================================

export const VALID_SHIPPING_METHODS = ['pickup', 'ups'] as const

export type ShippingMethod = typeof VALID_SHIPPING_METHODS[number]

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  pickup: 'Local Pickup (Baton Rouge, LA)',
  ups: 'UPS Shipping',
}

// ===================================
// API & Query Limits
// ===================================

/** Limit for random button fetching to prevent excessive data transfer */
export const RANDOM_BUTTON_FETCH_LIMIT = 100

/** Default maximum categories returned by categories API endpoint */
export const CATEGORY_LIST_LIMIT = 1000

/** Maximum items allowed in cart for checkout */
export const MAX_CART_ITEMS = 100

/** Maximum length for button names */
export const MAX_BUTTON_NAME_LENGTH = 100

/** Maximum length for person names in forms */
export const MAX_PERSON_NAME_LENGTH = 50

// ===================================
// File Upload Constants
// ===================================

/** Maximum file size for image uploads (5MB) */
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

/** Allowed image MIME types for uploads */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

/** Allowed image file extensions for uploads */
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const

// ===================================
// Email Validation
// ===================================

/** Regular expression for basic email validation */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ===================================
// Business Constants
// ===================================

/** Default business location (can be overridden by SiteSettings) */
export const DEFAULT_BUSINESS_LOCATION = 'Baton Rouge, LA'

/** Default button size */
export const DEFAULT_BUTTON_SIZE = '3"'

/** Default lead time for production in days */
export const DEFAULT_LEAD_TIME_DAYS = 7

// ===================================
// Rate Limiting
// ===================================

/** Checkout rate limit: max requests per minute */
export const CHECKOUT_RATE_LIMIT = 5

/** Contact form rate limit: max requests per minute */
export const CONTACT_RATE_LIMIT = 3

/** Custom request rate limit: max requests per minute */
export const CUSTOM_REQUEST_RATE_LIMIT = 3
