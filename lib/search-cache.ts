/**
 * Search Query Cache System
 *
 * In-memory LRU cache for search results with 30-day TTL.
 * Reduces API costs and improves response times for repeated queries.
 */

import { createHash } from 'crypto'
import type { SerperSearchType, SerperRequest, SerperResponse } from './serper-types'

// Cache configuration
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
const MAX_CACHE_SIZE = 1000 // Maximum number of cached entries
const CLEANUP_INTERVAL = 60 * 60 * 1000 // Clean up expired entries every hour

// Cache entry interface
interface CacheEntry {
  key: string
  value: SerperResponse
  timestamp: number
  lastAccess: number
  hits: number
  size: number // Estimated size in bytes
}

// Cache statistics
interface CacheStats {
  totalEntries: number
  totalHits: number
  totalMisses: number
  totalSize: number // Estimated total size in bytes
  hitRate: number // Percentage
  oldestEntry: number | null // Timestamp
  newestEntry: number | null // Timestamp
}

/**
 * LRU Cache Implementation
 * Uses Map for O(1) lookup and automatic insertion order tracking
 */
class SearchCache {
  private cache: Map<string, CacheEntry>
  private hits: number
  private misses: number
  private cleanupTimer: NodeJS.Timeout | null

  constructor() {
    this.cache = new Map()
    this.hits = 0
    this.misses = 0
    this.cleanupTimer = null

    // Start automatic cleanup
    this.startCleanup()
  }

  /**
   * Generate cache key from search parameters
   */
  private generateKey(
    type: SerperSearchType,
    params: SerperRequest
  ): string {
    // Normalize parameters for consistent hashing
    const normalized = {
      type,
      q: params.q.trim().toLowerCase(),
      num: params.num || 10,
      gl: params.gl || 'us',
      hl: params.hl || 'en',
      tbs: params.tbs || '',
      autocorrect: params.autocorrect !== false, // Default true
      location: params.location || '',
      page: params.page || 1,
    }

    // Create hash of normalized params
    const hash = createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex')
      .substring(0, 16) // Use first 16 chars for shorter keys

    return `search:${type}:${hash}`
  }

  /**
   * Estimate size of cache entry in bytes
   */
  private estimateSize(entry: CacheEntry): number {
    try {
      return JSON.stringify(entry.value).length
    } catch {
      return 0
    }
  }

  /**
   * Get cached result if available and not expired
   */
  get(
    type: SerperSearchType,
    params: SerperRequest
  ): SerperResponse | null {
    const key = this.generateKey(type, params)
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    // Update access metadata
    entry.lastAccess = now
    entry.hits++
    this.hits++

    // Move to end of map (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  /**
   * Store result in cache
   */
  set(
    type: SerperSearchType,
    params: SerperRequest,
    result: SerperResponse
  ): void {
    const key = this.generateKey(type, params)
    const now = Date.now()

    // Create new entry
    const entry: CacheEntry = {
      key,
      value: result,
      timestamp: now,
      lastAccess: now,
      hits: 0,
      size: 0,
    }

    // Estimate size
    entry.size = this.estimateSize(entry)

    // Check cache size limit
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry (first entry in Map)
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // Store entry
    this.cache.set(key, entry)
  }

  /**
   * Clear all expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      console.log(`[SearchCache] Cleaned up ${removed} expired entries`)
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, CLEANUP_INTERVAL)
  }

  /**
   * Stop automatic cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalRequests = this.hits + this.misses

    return {
      totalEntries: this.cache.size,
      totalHits: this.hits,
      totalMisses: this.misses,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null,
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Singleton instance
const searchCache = new SearchCache()

// Export cache instance and helper functions
export { searchCache, type CacheStats }

/**
 * Helper: Get cached search result
 */
export function getCachedSearch(
  type: SerperSearchType,
  params: SerperRequest
): SerperResponse | null {
  return searchCache.get(type, params)
}

/**
 * Helper: Cache search result
 */
export function setCachedSearch(
  type: SerperSearchType,
  params: SerperRequest,
  result: SerperResponse
): void {
  searchCache.set(type, params, result)
}

/**
 * Helper: Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return searchCache.getStats()
}

/**
 * Helper: Clear cache
 */
export function clearCache(): void {
  searchCache.clear()
}
