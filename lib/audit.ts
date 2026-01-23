/**
 * Audit logging for admin actions
 * Logs important actions for security and debugging purposes
 */

export type AuditAction =
  | 'order.status_updated'
  | 'order.deleted'
  | 'button.created'
  | 'button.updated'
  | 'button.deleted'
  | 'category.created'
  | 'category.updated'
  | 'category.deleted'
  | 'custom_request.status_updated'
  | 'user.login'
  | 'user.logout'

export type AuditLogEntry = {
  timestamp: string
  action: AuditAction
  userId?: string
  userEmail?: string
  resourceType: string
  resourceId: string
  details?: Record<string, unknown>
  ip?: string
}

/**
 * Log an admin action for audit purposes
 * In production, this could be extended to write to a database or external service
 */
export function auditLog(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }

  // Format for structured logging
  const logMessage = JSON.stringify({
    type: 'AUDIT',
    ...logEntry,
  })

  // Log to console (in production, could send to logging service)
  console.log(logMessage)
}

/**
 * Create an audit logger for a specific user context
 */
export function createAuditLogger(user: { id?: string; email?: string } | null, ip?: string) {
  return {
    log(
      action: AuditAction,
      resourceType: string,
      resourceId: string,
      details?: Record<string, unknown>
    ) {
      auditLog({
        action,
        userId: user?.id,
        userEmail: user?.email,
        resourceType,
        resourceId,
        details,
        ip,
      })
    },
  }
}
