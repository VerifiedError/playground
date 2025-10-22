/**
 * Audit Logger Utility
 *
 * CIA-Level audit logging for all system actions.
 * Every user action, system event, and API call should be logged.
 */

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export type AuditAction =
  // Authentication
  | 'user.login'
  | 'user.logout'
  | 'user.login.failed'
  | 'user.register'
  | 'user.password.change'
  | 'user.password.reset'
  // Session Management
  | 'session.create'
  | 'session.delete'
  | 'session.update'
  | 'session.view'
  // Admin Actions
  | 'admin.user.create'
  | 'admin.user.update'
  | 'admin.user.delete'
  | 'admin.user.ban'
  | 'admin.model.update'
  | 'admin.settings.update'
  | 'admin.cache.clear'
  // API Calls
  | 'api.chat'
  | 'api.search'
  | 'api.upload'
  | 'api.models'
  | 'api.workflow'
  // Search Actions
  | 'search.query'
  | 'search.result.click'
  | 'search.ai.chat'
  // System Events
  | 'system.startup'
  | 'system.shutdown'
  | 'system.error'
  | 'system.warning'
  // Page Views
  | 'page.view'
  | 'page.error'

export type AuditCategory = 'auth' | 'session' | 'admin' | 'api' | 'system' | 'search' | 'user'

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface AuditLogData {
  userId?: number
  action: AuditAction
  category: AuditCategory
  severity?: AuditSeverity
  description?: string
  metadata?: Record<string, any>
  resourceType?: string
  resourceId?: string
  requestMethod?: string
  requestPath?: string
  statusCode?: number
  responseTime?: number
  changesBefore?: Record<string, any>
  changesAfter?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an audit event
 */
export async function logAudit(data: AuditLogData) {
  try {
    // Get request headers for IP and user agent (if available)
    let ipAddress = data.ipAddress
    let userAgent = data.userAgent

    try {
      const headersList = headers()
      if (!ipAddress) {
        ipAddress =
          headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
          headersList.get('x-real-ip') ||
          undefined
      }
      if (!userAgent) {
        userAgent = headersList.get('user-agent') || undefined
      }
    } catch (e) {
      // Headers not available (e.g., in edge runtime or non-request context)
    }

    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        category: data.category,
        severity: data.severity || 'info',
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        requestMethod: data.requestMethod,
        requestPath: data.requestPath,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        changesBefore: data.changesBefore ? JSON.stringify(data.changesBefore) : null,
        changesAfter: data.changesAfter ? JSON.stringify(data.changesAfter) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Silent fail - don't break the app if audit logging fails
    console.error('[Audit] Failed to log audit event:', error)
  }
}

/**
 * Log a security event
 */
export async function logSecurityEvent(data: {
  userId?: number
  eventType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  country?: string
  isVpn?: boolean
  isTor?: boolean
  targetResource?: string
  attackVector?: string
  actionTaken?: 'blocked' | 'throttled' | 'flagged' | 'none'
}) {
  try {
    // Get request headers for IP and user agent (if available)
    let ipAddress = data.ipAddress
    let userAgent = data.userAgent

    try {
      const headersList = headers()
      if (!ipAddress) {
        ipAddress =
          headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
          headersList.get('x-real-ip') ||
          '0.0.0.0'
      }
      if (!userAgent) {
        userAgent = headersList.get('user-agent') || undefined
      }
    } catch (e) {
      ipAddress = data.ipAddress || '0.0.0.0'
    }

    // Check if event already exists for this IP/event type
    const existing = await prisma.securityEvent.findFirst({
      where: {
        ipAddress,
        eventType: data.eventType,
        isResolved: false,
      },
      orderBy: {
        lastSeen: 'desc',
      },
    })

    if (existing) {
      // Update existing event (increment attempt count, update lastSeen)
      await prisma.securityEvent.update({
        where: { id: existing.id },
        data: {
          attemptCount: existing.attemptCount + 1,
          lastSeen: new Date(),
          severity: data.severity, // Update severity if escalated
        },
      })
    } else {
      // Create new security event
      await prisma.securityEvent.create({
        data: {
          userId: data.userId,
          eventType: data.eventType,
          severity: data.severity,
          description: data.description,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress,
          userAgent,
          country: data.country,
          isVpn: data.isVpn,
          isTor: data.isTor,
          targetResource: data.targetResource,
          attackVector: data.attackVector,
          actionTaken: data.actionTaken,
        },
      })
    }
  } catch (error) {
    console.error('[Security] Failed to log security event:', error)
  }
}

/**
 * Log API usage
 */
export async function logApiUsage(data: {
  userId?: number
  apiKeyId?: string
  method: string
  endpoint: string
  fullUrl?: string
  ipAddress?: string
  userAgent?: string
  requestHeaders?: Record<string, string>
  requestBody?: Record<string, any>
  queryParams?: Record<string, any>
  statusCode: number
  responseTime: number
  responseSize?: number
  errorMessage?: string
  errorStack?: string
  cpuTime?: number
  memoryUsed?: number
}) {
  try {
    // Get request headers for IP and user agent (if available)
    let ipAddress = data.ipAddress
    let userAgent = data.userAgent

    try {
      const headersList = headers()
      if (!ipAddress) {
        ipAddress =
          headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
          headersList.get('x-real-ip') ||
          '0.0.0.0'
      }
      if (!userAgent) {
        userAgent = headersList.get('user-agent') || undefined
      }
    } catch (e) {
      ipAddress = data.ipAddress || '0.0.0.0'
    }

    await prisma.apiUsageLog.create({
      data: {
        userId: data.userId,
        apiKeyId: data.apiKeyId,
        method: data.method,
        endpoint: data.endpoint,
        fullUrl: data.fullUrl,
        ipAddress,
        userAgent,
        requestHeaders: data.requestHeaders ? JSON.stringify(data.requestHeaders) : null,
        requestBody: data.requestBody ? JSON.stringify(data.requestBody) : null,
        queryParams: data.queryParams ? JSON.stringify(data.queryParams) : null,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        responseSize: data.responseSize,
        errorMessage: data.errorMessage,
        errorStack: data.errorStack,
        cpuTime: data.cpuTime,
        memoryUsed: data.memoryUsed,
      },
    })
  } catch (error) {
    console.error('[API Usage] Failed to log API usage:', error)
  }
}

/**
 * Log search analytics
 */
export async function logSearchAnalytics(data: {
  userId?: number
  sessionId?: string
  searchType: string
  query: string
  normalizedQuery?: string
  filters?: Record<string, any>
  resultsCount?: number
  actualResults?: number
  hasResults?: boolean
  cached?: boolean
  searchDuration?: number
  apiCost?: number
  clickedResults?: number[]
  timeOnResults?: number
  refineCount?: number
  usedAiChat?: boolean
  aiMessages?: number
  aiCost?: number
  ipAddress?: string
  country?: string
  device?: string
  browser?: string
}) {
  try {
    // Get request headers for IP (if available)
    let ipAddress = data.ipAddress

    try {
      const headersList = headers()
      if (!ipAddress) {
        ipAddress =
          headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
          headersList.get('x-real-ip') ||
          undefined
      }
    } catch (e) {
      // Headers not available
    }

    await prisma.searchAnalytics.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        searchType: data.searchType,
        query: data.query,
        normalizedQuery: data.normalizedQuery || data.query.toLowerCase().trim(),
        filters: data.filters ? JSON.stringify(data.filters) : null,
        resultsCount: data.resultsCount,
        actualResults: data.actualResults,
        hasResults: data.hasResults !== undefined ? data.hasResults : true,
        cached: data.cached || false,
        searchDuration: data.searchDuration,
        apiCost: data.apiCost,
        clickedResults: data.clickedResults ? JSON.stringify(data.clickedResults) : null,
        timeOnResults: data.timeOnResults,
        refineCount: data.refineCount || 0,
        usedAiChat: data.usedAiChat || false,
        aiMessages: data.aiMessages || 0,
        aiCost: data.aiCost,
        ipAddress,
        country: data.country,
        device: data.device,
        browser: data.browser,
      },
    })
  } catch (error) {
    console.error('[Search Analytics] Failed to log search analytics:', error)
  }
}

/**
 * Log system metrics
 */
export async function logSystemMetric(data: {
  metricType: string
  metricName: string
  value: number
  unit?: string
  warningLevel?: number
  criticalLevel?: number
  tags?: Record<string, any>
  metadata?: Record<string, any>
}) {
  try {
    // Determine status based on thresholds
    let status = 'normal'
    if (data.criticalLevel && data.value >= data.criticalLevel) {
      status = 'critical'
    } else if (data.warningLevel && data.value >= data.warningLevel) {
      status = 'warning'
    }

    await prisma.systemMetric.create({
      data: {
        metricType: data.metricType,
        metricName: data.metricName,
        value: data.value,
        unit: data.unit,
        warningLevel: data.warningLevel,
        criticalLevel: data.criticalLevel,
        status,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })
  } catch (error) {
    console.error('[System Metrics] Failed to log system metric:', error)
  }
}
