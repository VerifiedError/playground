/**
 * Security Audit Logging
 *
 * Centralized system for logging security-related events.
 * Helps with incident response, monitoring, and compliance.
 */

export type SecurityEventType =
  // Authentication events
  | 'auth_login_success'
  | 'auth_login_failed'
  | 'auth_logout'
  | 'auth_session_expired'
  | 'auth_register_success'
  | 'auth_register_failed'
  // Rate limiting events
  | 'rate_limit_exceeded'
  | 'rate_limit_warning' // 80% of limit reached
  // Input validation events
  | 'input_sanitization'
  | 'xss_attempt_blocked'
  | 'sql_injection_attempt'
  | 'path_traversal_attempt'
  // File upload events
  | 'file_upload_success'
  | 'file_upload_rejected'
  | 'file_validation_failed'
  | 'file_security_risk'
  | 'file_size_exceeded'
  // Access control events
  | 'unauthorized_access_attempt'
  | 'forbidden_resource_access'
  | 'admin_action'
  // API security events
  | 'api_abuse_detected'
  | 'suspicious_activity'
  | 'malformed_request'

export type SecuritySeverity = 'info' | 'warning' | 'critical'

export interface SecurityAuditLog {
  timestamp: Date
  eventType: SecurityEventType
  severity: SecuritySeverity
  userId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  message: string
  metadata?: Record<string, any>
}

/**
 * In-memory log store (for development)
 * In production, this should write to a database or external logging service
 */
const auditLogs: SecurityAuditLog[] = []
const MAX_MEMORY_LOGS = 1000 // Keep last 1000 logs in memory

/**
 * Log a security event
 *
 * @param event - Security event details
 */
export function logSecurityEvent(event: {
  eventType: SecurityEventType
  severity: SecuritySeverity
  userId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  message: string
  metadata?: Record<string, any>
}): void {
  const log: SecurityAuditLog = {
    timestamp: new Date(),
    ...event,
  }

  // Add to in-memory store
  auditLogs.push(log)

  // Trim to max size (circular buffer)
  if (auditLogs.length > MAX_MEMORY_LOGS) {
    auditLogs.shift()
  }

  // Console logging with severity-based formatting
  const prefix = getSeverityPrefix(event.severity)
  const logMessage = `${prefix} [${event.eventType}] ${event.message}`

  if (event.severity === 'critical') {
    console.error(logMessage, event.metadata || '')
  } else if (event.severity === 'warning') {
    console.warn(logMessage, event.metadata || '')
  } else {
    console.info(logMessage, event.metadata || '')
  }

  // TODO: In production, also write to:
  // - Database (SecurityAuditLog table)
  // - External logging service (e.g., Datadog, Sentry)
  // - Security Information and Event Management (SIEM) system
}

/**
 * Get severity prefix for console output
 */
function getSeverityPrefix(severity: SecuritySeverity): string {
  switch (severity) {
    case 'critical':
      return '\u{1F6A8} [CRITICAL]' // 🚨
    case 'warning':
      return '\u{26A0}\u{FE0F} [WARNING]' // ⚠️
    case 'info':
      return '\u{2139}\u{FE0F} [INFO]' // ℹ️
  }
}

/**
 * Get recent security logs
 *
 * @param limit - Maximum number of logs to return
 * @param severity - Filter by severity level
 * @param eventType - Filter by event type
 * @returns Array of security audit logs
 */
export function getSecurityLogs(
  limit = 100,
  severity?: SecuritySeverity,
  eventType?: SecurityEventType
): SecurityAuditLog[] {
  let filtered = auditLogs

  if (severity) {
    filtered = filtered.filter((log) => log.severity === severity)
  }

  if (eventType) {
    filtered = filtered.filter((log) => log.eventType === eventType)
  }

  // Return most recent logs first
  return filtered.slice(-limit).reverse()
}

/**
 * Get security event statistics
 *
 * @param timeWindow - Time window in milliseconds (default: last 24 hours)
 * @returns Security event statistics
 */
export function getSecurityStats(timeWindow = 24 * 60 * 60 * 1000): {
  total: number
  bySeverity: Record<SecuritySeverity, number>
  byType: Partial<Record<SecurityEventType, number>>
  recentEvents: SecurityAuditLog[]
} {
  const now = new Date()
  const cutoff = new Date(now.getTime() - timeWindow)

  const recentLogs = auditLogs.filter((log) => log.timestamp >= cutoff)

  const stats = {
    total: recentLogs.length,
    bySeverity: {
      info: 0,
      warning: 0,
      critical: 0,
    } as Record<SecuritySeverity, number>,
    byType: {} as Partial<Record<SecurityEventType, number>>,
    recentEvents: recentLogs.slice(-10).reverse(), // Last 10 events
  }

  for (const log of recentLogs) {
    // Count by severity
    stats.bySeverity[log.severity]++

    // Count by type
    stats.byType[log.eventType] = (stats.byType[log.eventType] || 0) + 1
  }

  return stats
}

/**
 * Clear audit logs (for testing/development only)
 */
export function clearSecurityLogs(): void {
  auditLogs.length = 0
  console.warn('[Security] Audit logs cleared')
}

// ===========================================
// Convenience functions for common events
// ===========================================

/**
 * Log authentication success
 */
export function logAuthSuccess(userId: string, ipAddress: string, userAgent?: string): void {
  logSecurityEvent({
    eventType: 'auth_login_success',
    severity: 'info',
    userId,
    ipAddress,
    userAgent,
    message: `User ${userId} logged in successfully`,
  })
}

/**
 * Log authentication failure
 */
export function logAuthFailure(
  username: string,
  ipAddress: string,
  reason: string,
  userAgent?: string
): void {
  logSecurityEvent({
    eventType: 'auth_login_failed',
    severity: 'warning',
    ipAddress,
    userAgent,
    message: `Failed login attempt for user ${username}: ${reason}`,
    metadata: { username, reason },
  })
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
  endpoint: string,
  identifier: string,
  ipAddress?: string
): void {
  logSecurityEvent({
    eventType: 'rate_limit_exceeded',
    severity: 'warning',
    endpoint,
    ipAddress,
    message: `Rate limit exceeded for ${endpoint} by ${identifier}`,
    metadata: { identifier },
  })
}

/**
 * Log file upload rejection
 */
export function logFileUploadRejected(
  userId: string,
  fileName: string,
  reason: string,
  ipAddress?: string
): void {
  logSecurityEvent({
    eventType: 'file_upload_rejected',
    severity: 'warning',
    userId,
    ipAddress,
    endpoint: '/api/upload',
    message: `File upload rejected: ${fileName} - ${reason}`,
    metadata: { fileName, reason },
  })
}

/**
 * Log security risk detection
 */
export function logSecurityRisk(
  userId: string,
  riskType: string,
  details: string,
  ipAddress?: string
): void {
  logSecurityEvent({
    eventType: 'file_security_risk',
    severity: 'critical',
    userId,
    ipAddress,
    message: `Security risk detected: ${riskType} - ${details}`,
    metadata: { riskType, details },
  })
}

/**
 * Log XSS attempt
 */
export function logXSSAttempt(
  userId: string | undefined,
  content: string,
  endpoint: string,
  ipAddress?: string
): void {
  logSecurityEvent({
    eventType: 'xss_attempt_blocked',
    severity: 'critical',
    userId,
    ipAddress,
    endpoint,
    message: `XSS attempt blocked in ${endpoint}`,
    metadata: {
      suspiciousContent: content.substring(0, 100), // First 100 chars
    },
  })
}

/**
 * Log path traversal attempt
 */
export function logPathTraversalAttempt(
  userId: string | undefined,
  fileName: string,
  ipAddress?: string
): void {
  logSecurityEvent({
    eventType: 'path_traversal_attempt',
    severity: 'critical',
    userId,
    ipAddress,
    endpoint: '/api/upload',
    message: `Path traversal attempt detected: ${fileName}`,
    metadata: { fileName },
  })
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(
  endpoint: string,
  userId: string | undefined,
  ipAddress?: string,
  userAgent?: string
): void {
  logSecurityEvent({
    eventType: 'unauthorized_access_attempt',
    severity: 'warning',
    userId,
    ipAddress,
    userAgent,
    endpoint,
    message: `Unauthorized access attempt to ${endpoint}`,
  })
}

/**
 * Log admin action
 */
export function logAdminAction(
  userId: string,
  action: string,
  targetUserId?: string,
  ipAddress?: string
): void {
  logSecurityEvent({
    eventType: 'admin_action',
    severity: 'info',
    userId,
    ipAddress,
    message: `Admin action: ${action}`,
    metadata: { action, targetUserId },
  })
}
