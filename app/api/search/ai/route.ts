/**
 * AI Search API Endpoint
 *
 * POST /api/search/ai
 *
 * AI-powered search using Groq LLM + Serper API
 * - Analyzes natural language queries
 * - Automatically selects search type
 * - Returns full JSON results with AI summary
 * - Enforces 1 search per query (credit limit)
 *
 * Request:
 * {
 *   query: string,              // User's natural language question
 *   model?: string,             // AI model (default: llama-3.1-8b-instant)
 *   maxTokens?: number,         // Max output tokens
 *   temperature?: number,       // Response creativity (0-2)
 *   includeReasoning?: boolean  // Include AI's reasoning
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: AISearchResult,
 *   cached: boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { performAISearch, validateAIConfig, type AISearchResult } from '@/lib/ai-search-agent'
import { checkCreditLimit, recordSearchUsage } from '@/lib/credit-manager'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Simple in-memory cache for AI search results (30-day TTL)
const AI_SEARCH_CACHE = new Map<string, { result: AISearchResult; timestamp: number }>()
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

function getCachedAISearch(key: string): AISearchResult | null {
  const cached = AI_SEARCH_CACHE.get(key)
  if (!cached) return null

  const age = Date.now() - cached.timestamp
  if (age > CACHE_TTL) {
    AI_SEARCH_CACHE.delete(key)
    return null
  }

  return cached.result
}

function setCachedAISearch(key: string, result: AISearchResult): void {
  AI_SEARCH_CACHE.set(key, { result, timestamp: Date.now() })

  // Cleanup old entries (keep max 100)
  if (AI_SEARCH_CACHE.size > 100) {
    const entries = Array.from(AI_SEARCH_CACHE.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    AI_SEARCH_CACHE.delete(entries[0][0])
  }
}

interface AISearchRequest {
  query: string
  model?: string
  maxTokens?: number
  temperature?: number
  includeReasoning?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AISearchRequest = await request.json()

    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Validate and sanitize config
    const config = validateAIConfig({
      model: body.model,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
    })

    // Check credit limits (1 search = 1 credit)
    // AI search counts as 1 Serper API call
    const creditCheck = checkCreditLimit(10, false) // Default 10 results

    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Credit limit exceeded',
          reason: creditCheck.reason,
        },
        { status: 429 }
      )
    }

    // Show warning if approaching limits
    if (creditCheck.warning) {
      console.warn('[AI Search] Credit warning:', creditCheck.warning)
    }

    // Check cache first (48hr cache)
    // Cache key: query + model
    const cacheKey = `${body.query.trim().toLowerCase()}:${config.model}`
    const cachedResult = getCachedAISearch(cacheKey)

    if (cachedResult) {
      console.log('[AI Search] Cache HIT:', cacheKey.substring(0, 50))
      return NextResponse.json(
        {
          success: true,
          data: cachedResult,
          cached: true,
        },
        {
          status: 200,
          headers: {
            'X-Cache': 'HIT',
          },
        }
      )
    }

    // Execute AI search
    console.log('[AI Search] Executing:', {
      query: body.query,
      model: config.model,
    })

    const result = await performAISearch(body.query, config)

    // Remove reasoning if not requested
    if (!body.includeReasoning) {
      delete result.reasoning
    }

    // Record credit usage (1 search executed)
    recordSearchUsage(10) // Count as 10 results (standard search)

    // Cache results
    setCachedAISearch(cacheKey, result)

    // Get result count based on search type
    const resultCount =
      (result.results as any).organic?.length ||
      (result.results as any).images?.length ||
      (result.results as any).videos?.length ||
      (result.results as any).places?.length ||
      (result.results as any).news?.length ||
      0

    console.log('[AI Search] Success:', {
      searchType: result.searchType,
      searchQuery: result.searchQuery,
      resultCount,
      cost: result.cost.totalCost,
    })

    return NextResponse.json(
      {
        success: true,
        data: result,
        cached: false,
      },
      {
        status: 200,
        headers: {
          'X-Cache': 'MISS',
        },
      }
    )
  } catch (error: any) {
    console.error('[AI Search API] Error:', error)

    // Handle specific error types
    if (error.message?.includes('Credit limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    if (error.message?.includes('Groq') || error.message?.includes('API')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'AI search failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
