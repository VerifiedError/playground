/**
 * API Key Validation Middleware
 *
 * Validates API keys for external API requests.
 * Supports Bearer token authentication with API keys.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashApiKey, isValidApiKeyFormat, hasPermission } from '@/lib/api-key-utils'

// Rate limiting store (in-memory, reset on server restart)
// In production, use Redis or a similar distributed cache
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Validate API key from request
 * Extracts the API key from Authorization header and validates it
 *
 * @param request - Next.js request object
 * @param requiredPermission - Permission required for this endpoint (e.g., 'chat', 'sessions')
 * @returns Object with validation result and user/key info
 */
export async function validateApiKey(
  request: NextRequest,
  requiredPermission: string = 'chat'
): Promise<{
  valid: boolean
  error?: string
  status?: number
  userId?: number
  apiKeyId?: string
  rateLimit?: number
}> {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return {
        valid: false,
        error: 'Missing Authorization header. Use: Authorization: Bearer YOUR_API_KEY',
        status: 401,
      }
    }

    // Check format: "Bearer pk_live_..."
    if (!authHeader.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Invalid Authorization header format. Use: Authorization: Bearer YOUR_API_KEY',
        status: 401,
      }
    }

    const apiKey = authHeader.substring(7).trim() // Remove "Bearer "

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      return {
        valid: false,
        error: 'Invalid API key format. Expected: pk_live_... or pk_test_...',
        status: 401,
      }
    }

    // Hash the API key for database lookup
    const keyHash = hashApiKey(apiKey)

    // Look up API key in database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      select: {
        id: true,
        userId: true,
        permissions: true,
        rateLimit: true,
        isActive: true,
        expiresAt: true,
        totalRequests: true,
      },
    })

    if (!apiKeyRecord) {
      return {
        valid: false,
        error: 'Invalid API key',
        status: 401,
      }
    }

    // Check if API key is active
    if (!apiKeyRecord.isActive) {
      return {
        valid: false,
        error: 'API key is disabled',
        status: 403,
      }
    }

    // Check if API key has expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return {
        valid: false,
        error: 'API key has expired',
        status: 403,
      }
    }

    // Check permissions
    if (!hasPermission(apiKeyRecord.permissions, requiredPermission)) {
      return {
        valid: false,
        error: `API key does not have '${requiredPermission}' permission`,
        status: 403,
      }
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(apiKeyRecord.id, apiKeyRecord.rateLimit)
    if (!rateLimitCheck.allowed) {
      return {
        valid: false,
        error: `Rate limit exceeded. Limit: ${apiKeyRecord.rateLimit} requests per minute. Try again in ${rateLimitCheck.retryAfter}s`,
        status: 429,
      }
    }

    // Update usage tracking
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'

    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        totalRequests: { increment: 1 },
        lastUsedAt: new Date(),
        lastUsedIp: clientIp,
      },
    })

    // API key is valid!
    return {
      valid: true,
      userId: apiKeyRecord.userId,
      apiKeyId: apiKeyRecord.id,
      rateLimit: apiKeyRecord.rateLimit,
    }
  } catch (error: any) {
    console.error('Error validating API key:', error)
    return {
      valid: false,
      error: 'Internal server error during API key validation',
      status: 500,
    }
  }
}

/**
 * Check rate limit for an API key
 * Uses in-memory store (reset on server restart)
 *
 * @param apiKeyId - The API key ID
 * @param limit - Requests per minute allowed
 * @returns Object with allowed status and retry time
 */
async function checkRateLimit(
  apiKeyId: string,
  limit: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute

  const record = rateLimitStore.get(apiKeyId)

  // No record or window expired - allow request
  if (!record || record.resetAt <= now) {
    rateLimitStore.set(apiKeyId, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { allowed: true }
  }

  // Within window - check count
  if (record.count < limit) {
    record.count++
    rateLimitStore.set(apiKeyId, record)
    return { allowed: true }
  }

  // Rate limit exceeded
  const retryAfter = Math.ceil((record.resetAt - now) / 1000)
  return {
    allowed: false,
    retryAfter,
  }
}

/**
 * Create an error response for API key validation failures
 *
 * @param error - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createApiKeyErrorResponse(error: string, status: number): NextResponse {
  return NextResponse.json(
    {
      error,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
