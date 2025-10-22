/**
 * Search API Route
 *
 * POST /api/search
 *
 * Proxies search requests to Serper.dev API.
 * This endpoint can be publicly accessible or require authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchSerper } from '@/lib/serper-client'
import type { SerperSearchType, SerperRequest, LeakCheckSearchResponse } from '@/lib/serper-types'
import { getCachedSearch, setCachedSearch, getCacheStats } from '@/lib/search-cache'
import { checkRateLimit as globalCheckRateLimit, getClientIdentifier, getRateLimitHeaders, type RateLimitConfig } from '@/lib/security/rate-limiter'
import { createLeakCheckClient } from '@/lib/leakcheck-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Search-specific rate limit configuration (100 requests per minute)
const SEARCH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 60,
  name: 'search',
}

/**
 * POST /api/search
 * Perform a search using Serper.dev API
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // RATE LIMITING (100 requests per minute per IP)
    // ============================================
    const identifier = getClientIdentifier(request)
    const rateLimitResult = globalCheckRateLimit(identifier, SEARCH_RATE_LIMIT)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many search requests. Please wait ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      type = 'search', // Default to web search
      q,
      num = 10,
      gl = 'us',
      hl = 'en',
      tbs,
      autocorrect = true,
      location,
      page,
    } = body

    // Validation
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Query parameter "q" is required and cannot be empty',
        },
        { status: 400 }
      )
    }

    // Validate search type
    const validTypes: SerperSearchType[] = [
      'search',
      'images',
      'videos',
      'places',
      'maps',
      'news',
      'scholar',
      'shopping',
      'leakcheck',
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: `Invalid search type. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate num parameter
    if (num && (typeof num !== 'number' || num < 1 || num > 100)) {
      return NextResponse.json(
        {
          error: 'num parameter must be a number between 1 and 100',
        },
        { status: 400 }
      )
    }

    // Build search parameters
    const searchParams: SerperRequest = {
      q: q.trim(),
      num,
      gl,
      hl,
      autocorrect,
    }

    if (tbs) searchParams.tbs = tbs
    if (location) searchParams.location = location
    if (page) searchParams.page = page

    // ============================================
    // LEAKCHECK API HANDLING (Breach/Leak Checking)
    // ============================================
    if (type === 'leakcheck') {
      const queryType = body.queryType || 'auto' // Default to auto-detect

      // Check cache first (30-day TTL for LeakCheck results)
      const cachedResult = getCachedSearch(type, searchParams)
      if (cachedResult) {
        const cacheStats = getCacheStats()
        return NextResponse.json(
          {
            success: true,
            type,
            results: cachedResult,
            metadata: {
              query: q,
              duration: 0,
              timestamp: new Date().toISOString(),
              credits: 0,
              cached: true,
              cacheStats: {
                hitRate: cacheStats.hitRate.toFixed(1) + '%',
                totalEntries: cacheStats.totalEntries,
              },
            },
          },
          {
            headers: {
              'X-Cache': 'HIT',
              'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
            },
          }
        )
      }

      // Create LeakCheck client
      const leakCheckClient = createLeakCheckClient()
      if (!leakCheckClient) {
        return NextResponse.json(
          {
            error: 'LeakCheck API is not configured. Please add LEAKCHECK_API_KEY to environment variables.',
          },
          { status: 503 }
        )
      }

      // Perform LeakCheck query (cache miss)
      const startTime = Date.now()
      const leakCheckResponse = await leakCheckClient.query({
        query: q.trim(),
        type: queryType,
        limit: num,
        offset: page ? (page - 1) * num : 0,
      })
      const duration = Date.now() - startTime

      // Transform to standard response format
      const results: LeakCheckSearchResponse = {
        searchParameters: {
          q: q.trim(),
          type: 'leakcheck',
          queryType,
        },
        success: leakCheckResponse.success,
        found: leakCheckResponse.found,
        result: leakCheckResponse.result,
        error: leakCheckResponse.error,
      }

      // Cache the result (30-day TTL)
      setCachedSearch(type, searchParams, results)

      const cacheStats = getCacheStats()

      // Return results
      return NextResponse.json(
        {
          success: true,
          type,
          results,
          metadata: {
            query: q,
            duration,
            timestamp: new Date().toISOString(),
            credits: 1, // LeakCheck uses 1 credit per query
            cached: false,
            cacheStats: {
              hitRate: cacheStats.hitRate.toFixed(1) + '%',
              totalEntries: cacheStats.totalEntries,
            },
          },
        },
        {
          headers: {
            'X-Cache': 'MISS',
            'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
          },
        }
      )
    }

    // ============================================
    // SERPER.DEV API HANDLING (Standard Search)
    // ============================================

    // Check cache first (30-day TTL)
    const cachedResult = getCachedSearch(type, searchParams)
    if (cachedResult) {
      const cacheStats = getCacheStats()
      return NextResponse.json(
        {
          success: true,
          type,
          results: cachedResult,
          metadata: {
            query: q,
            duration: 0, // Cached response
            timestamp: new Date().toISOString(),
            credits: 0, // No API call made
            cached: true,
            cacheStats: {
              hitRate: cacheStats.hitRate.toFixed(1) + '%',
              totalEntries: cacheStats.totalEntries,
            },
          },
        },
        {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
          },
        }
      )
    }

    // Perform search (cache miss)
    const startTime = Date.now()
    const results = await searchSerper(type, searchParams)
    const duration = Date.now() - startTime

    // Cache the result
    setCachedSearch(type, searchParams, results)

    const cacheStats = getCacheStats()

    // Return results with metadata
    return NextResponse.json(
      {
        success: true,
        type,
        results,
        metadata: {
          query: q,
          duration,
          timestamp: new Date().toISOString(),
          credits: (results as any).credits || 1, // Serper returns credit usage
          cached: false,
          cacheStats: {
            hitRate: cacheStats.hitRate.toFixed(1) + '%',
            totalEntries: cacheStats.totalEntries,
          },
        },
      },
      {
        headers: {
          'X-Cache': 'MISS',
          'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
        },
      }
    )
  } catch (error: any) {
    console.error('Search API error:', error)

    // Return user-friendly error
    return NextResponse.json(
      {
        error: error.message || 'Failed to perform search',
        type: 'search_error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/search
 * Alternative GET endpoint for simple searches
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // RATE LIMITING (100 requests per minute per IP)
    // ============================================
    const identifier = getClientIdentifier(request)
    const rateLimitResult = globalCheckRateLimit(identifier, SEARCH_RATE_LIMIT)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many search requests. Please wait ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const type = (searchParams.get('type') || 'search') as SerperSearchType
    const num = parseInt(searchParams.get('num') || '10', 10)
    const gl = searchParams.get('gl') || 'us'
    const hl = searchParams.get('hl') || 'en'
    const tbsParam = searchParams.get('tbs')
    const tbs = tbsParam ? (tbsParam as any) : undefined

    // Validation
    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Query parameter "q" is required',
        },
        { status: 400 }
      )
    }

    // ============================================
    // LEAKCHECK API HANDLING (Breach/Leak Checking)
    // ============================================
    if (type === 'leakcheck') {
      const queryType = searchParams.get('queryType') || 'auto' // Default to auto-detect
      const page = parseInt(searchParams.get('page') || '1', 10)

      // Build search parameters object
      const serperParams: SerperRequest = { q, num, gl, hl }

      // Check cache first (30-day TTL for LeakCheck results)
      const cachedResult = getCachedSearch(type, serperParams)
      if (cachedResult) {
        const cacheStats = getCacheStats()
        return NextResponse.json(
          {
            success: true,
            type,
            results: cachedResult,
            metadata: {
              query: q,
              duration: 0,
              timestamp: new Date().toISOString(),
              credits: 0,
              cached: true,
              cacheStats: {
                hitRate: cacheStats.hitRate.toFixed(1) + '%',
                totalEntries: cacheStats.totalEntries,
              },
            },
          },
          {
            headers: {
              'X-Cache': 'HIT',
              'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
            },
          }
        )
      }

      // Create LeakCheck client
      const leakCheckClient = createLeakCheckClient()
      if (!leakCheckClient) {
        return NextResponse.json(
          {
            error: 'LeakCheck API is not configured. Please add LEAKCHECK_API_KEY to environment variables.',
          },
          { status: 503 }
        )
      }

      // Perform LeakCheck query (cache miss)
      const startTime = Date.now()
      const leakCheckResponse = await leakCheckClient.query({
        query: q.trim(),
        type: queryType as any,
        limit: num,
        offset: page ? (page - 1) * num : 0,
      })
      const duration = Date.now() - startTime

      // Transform to standard response format
      const results: LeakCheckSearchResponse = {
        searchParameters: {
          q: q.trim(),
          type: 'leakcheck',
          queryType,
        },
        success: leakCheckResponse.success,
        found: leakCheckResponse.found,
        result: leakCheckResponse.result,
        error: leakCheckResponse.error,
      }

      // Cache the result (30-day TTL)
      setCachedSearch(type, serperParams, results)

      const cacheStats = getCacheStats()

      // Return results
      return NextResponse.json(
        {
          success: true,
          type,
          results,
          metadata: {
            query: q,
            duration,
            timestamp: new Date().toISOString(),
            credits: 1, // LeakCheck uses 1 credit per query
            cached: false,
            cacheStats: {
              hitRate: cacheStats.hitRate.toFixed(1) + '%',
              totalEntries: cacheStats.totalEntries,
            },
          },
        },
        {
          headers: {
            'X-Cache': 'MISS',
            'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
          },
        }
      )
    }

    // ============================================
    // SERPER.DEV API HANDLING (Standard Search)
    // ============================================

    // Build search parameters object
    const serperParams: SerperRequest = { q, num, gl, hl }
    if (tbs) serperParams.tbs = tbs

    // Check cache first (48-hour TTL)
    const cachedResult = getCachedSearch(type, serperParams)
    if (cachedResult) {
      const cacheStats = getCacheStats()
      return NextResponse.json(
        {
          success: true,
          type,
          results: cachedResult,
          metadata: {
            query: q,
            duration: 0, // Cached response
            timestamp: new Date().toISOString(),
            credits: 0, // No API call made
            cached: true,
            cacheStats: {
              hitRate: cacheStats.hitRate.toFixed(1) + '%',
              totalEntries: cacheStats.totalEntries,
            },
          },
        },
        {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
          },
        }
      )
    }

    // Perform search (cache miss)
    const startTime = Date.now()
    const results = await searchSerper(type, serperParams)
    const duration = Date.now() - startTime

    // Cache the result
    setCachedSearch(type, serperParams, results)

    const cacheStats = getCacheStats()

    // Return results with metadata
    return NextResponse.json(
      {
        success: true,
        type,
        results,
        metadata: {
          query: q,
          duration,
          timestamp: new Date().toISOString(),
          credits: (results as any).credits || 1,
          cached: false,
          cacheStats: {
            hitRate: cacheStats.hitRate.toFixed(1) + '%',
            totalEntries: cacheStats.totalEntries,
          },
        },
      },
      {
        headers: {
          'X-Cache': 'MISS',
          'X-Cache-Hit-Rate': cacheStats.hitRate.toFixed(1),
        },
      }
    )
  } catch (error: any) {
    console.error('Search API error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to perform search',
        type: 'search_error',
      },
      { status: 500 }
    )
  }
}
