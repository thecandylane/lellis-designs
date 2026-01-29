import { NextResponse } from 'next/server'

/**
 * Standardized API error response utility
 * Prevents information leakage by logging details server-side and returning generic messages
 */

export type ApiErrorOptions = {
  /** HTTP status code (default: 500) */
  status?: number
  /** Additional context for server-side logging (not sent to client) */
  context?: Record<string, unknown>
  /** Whether to log the error (default: true) */
  log?: boolean
}

/**
 * Creates a standardized error response
 * Logs full error details server-side, returns generic message to client
 *
 * @param message - User-facing error message (keep generic)
 * @param error - The original error object (logged but not sent to client)
 * @param options - Additional options for logging and status code
 *
 * @example
 * ```ts
 * try {
 *   await riskyOperation()
 * } catch (error) {
 *   return apiError('Failed to process request', error, {
 *     status: 500,
 *     context: { userId: '123' }
 *   })
 * }
 * ```
 */
export function apiError(
  message: string,
  error?: unknown,
  options: ApiErrorOptions = {}
): NextResponse {
  const {
    status = 500,
    context = {},
    log = true,
  } = options

  // Log full error details server-side only
  if (log) {
    console.error('[API Error]', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      context,
      timestamp: new Date().toISOString(),
    })
  }

  // Return generic error to client (no stack traces or internal details)
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * Creates a success response with data
 *
 * @example
 * ```ts
 * return apiSuccess({ id: '123', name: 'Example' })
 * ```
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Creates a validation error response (400)
 *
 * @example
 * ```ts
 * if (!email) {
 *   return validationError('Email is required')
 * }
 * ```
 */
export function validationError(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

/**
 * Creates an unauthorized error response (401)
 */
export function unauthorizedError(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Creates a forbidden error response (403)
 */
export function forbiddenError(message = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

/**
 * Creates a not found error response (404)
 */
export function notFoundError(message = 'Not found'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  )
}
