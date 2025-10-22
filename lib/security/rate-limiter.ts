/**
 * Global Rate Limiting System
 *
 * Provides flexible rate limiting for API endpoints to prevent abuse.
 * Uses in-memory storage with automatic cleanup of expired entries.
 */

import { logSecurityEvent } from './audit-logger'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store for rate limit tracking
// Format: Map<identifier, RateLimitEntry>
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000

// Auto-cleanup old entries
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Unique identifier for this rate limiter */
  name: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Rate Limiting Presets
 */
export const RATE_LIMITS = {
  // Authentication endpoints - Very strict
  AUTH: { maxRequests: 5, windowSeconds: 15 * 60, name: 'auth' }, // 5 per 15min

  // Chat/AI endpoints - Moderate
  CHAT: { maxRequests: 20, windowSeconds: 60, name: 'chat' }, // 20 per minute

  // File upload - Strict
  UPLOAD: { maxRequests: 10, windowSeconds: 60 * 60, name: 'upload' }, // 10 per hour

  // Search endpoints - Moderate
  SEARCH: { maxRequests: 30, windowSeconds: 60, name: 'search' }, // 30 per minute

  // API read operations - Lenient
  API_READ: { maxRequests: 100, windowSeconds: 60, name: 'api-read' }, // 100 per minute

  // API write operations - Moderate
  API_WRITE: { maxRequests: 50, windowSeconds: 60, name: 'api-write' }, // 50 per minute

  // Global fallback - General protection
  GLOBAL: { maxRequests: 100, windowSeconds: 60, name: 'global' }, // 100 per minute
} as const

/**
 * Check and update rate limit for a given identifier
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID, API key)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${config.name}:${identifier}`

  // Get or create entry
  const entry = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + windowMs,
  }

  // Reset if window has expired
  if (entry.resetAt < now) {
    entry.count = 0
    entry.resetAt = now + windowMs
  }

  // Increment count
  entry.count++

  // Update store
  rateLimitStore.set(key, entry)

  // Calculate remaining
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const reset = Math.floor(entry.resetAt / 1000) // Unix timestamp

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)

    // Log rate limit exceeded event
    logSecurityEvent({
      eventType: 'rate_limit_exceeded',
      severity: 'warning',
      message: `Rate limit exceeded for ${config.name} by ${identifier}`,
      metadata: {
        limiter: config.name,
        identifier,
        count: entry.count,
        limit: config.maxRequests,
        retryAfter,
      },
    })

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset,
      retryAfter,
    }
  }

  // Log warning if approaching limit (80% threshold)
  const usagePercent = (entry.count / config.maxRequests) * 100
  if (usagePercent >= 80 && entry.count === Math.floor(config.maxRequests * 0.8)) {
    logSecurityEvent({
      eventType: 'rate_limit_warning',
      severity: 'info',
      message: `Rate limit warning: ${config.name} at ${usagePercent.toFixed(0)}% (${entry.count}/${config.maxRequests})`,
      metadata: {
        limiter: config.name,
        identifier,
        count: entry.count,
        limit: config.maxRequests,
        remaining,
      },
    })
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset,
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString(),
    }),
  }
}

/**
 * Get client identifier from request
 * Priority: User ID > IP Address > Fallback
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip =
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
    'unknown'

  return `ip:${ip}`
}

/**
 * Helper to get rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = `${config.name}:${identifier}`

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.floor((now + config.windowSeconds * 1000) / 1000),
    }
  }

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const reset = Math.floor(entry.resetAt / 1000)

  return {
    success: remaining > 0,
    limit: config.maxRequests,
    remaining,
    reset,
    retryAfter: remaining === 0 ? Math.ceil((entry.resetAt - now) / 1000) : undefined,
  }
}

/**
 * Clear rate limit for a specific identifier (admin use)
 */
export function clearRateLimit(identifier: string, configName: string): void {
  const key = `${configName}:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Get rate limiter statistics (for monitoring)
 */
export function getRateLimiterStats() {
  return {
    totalEntries: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetAt: new Date(entry.resetAt).toISOString(),
    })),
  }
}
