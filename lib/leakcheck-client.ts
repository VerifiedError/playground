/**
 * LeakCheck.io API Client
 *
 * API Documentation: https://wiki.leakcheck.io/en/api/api-v2-pro
 *
 * LeakCheck is a breach monitoring service that allows searching for
 * compromised credentials across data breaches.
 *
 * API Key: Configured via LEAKCHECK_API_KEY environment variable
 */

export interface LeakCheckQueryRequest {
  /** Email, username, domain, phone, etc. */
  query: string
  /** Query type: email, username, domain, phone, hash, etc. */
  type?: 'email' | 'username' | 'domain' | 'phone' | 'hash' | 'auto'
  /** Limit results (default 100, max 1000) */
  limit?: number
  /** Offset for pagination */
  offset?: number
}

export interface LeakCheckSource {
  /** Source name (breach name) */
  name: string
  /** Date of breach */
  date: string
  /** Number of records in this breach */
  records?: number
}

export interface LeakCheckResult {
  /** Found records */
  sources: Array<{
    /** Breach source name */
    name: string
    /** Date of breach */
    date: string
  }>
  /** Fields found in breaches */
  fields: string[]
  /** Record data (may be redacted based on plan) */
  line?: string
  /** Email address */
  email?: string
  /** Username */
  username?: string
  /** Password (may be hashed) */
  password?: string
  /** Hash type if password is hashed */
  hash?: string
  /** Full name */
  name?: string
  /** Phone number */
  phone?: string
  /** IP address */
  ip?: string
  /** Additional data */
  [key: string]: any
}

export interface LeakCheckQueryResponse {
  /** Whether search was successful */
  success: boolean
  /** Number of results found */
  found: number
  /** Result details */
  result: LeakCheckResult[] | null
  /** Error message if failed */
  error?: string
}

export interface LeakCheckSourcesResponse {
  /** Whether request was successful */
  success: boolean
  /** List of breach sources */
  sources: LeakCheckSource[]
  /** Error message if failed */
  error?: string
}

/**
 * LeakCheck API Client
 */
export class LeakCheckClient {
  private apiKey: string
  private baseUrl = 'https://leakcheck.io/api/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Query for leaked credentials
   *
   * @param request - Query parameters
   * @returns Query results
   */
  async query(request: LeakCheckQueryRequest): Promise<LeakCheckQueryResponse> {
    const { query, type = 'auto', limit = 100, offset = 0 } = request

    try {
      // LeakCheck API v2 format: /api/v2/query/{query}?key=...&type=...
      const params = new URLSearchParams({
        key: this.apiKey,
        type,
        limit: limit.toString(),
        offset: offset.toString(),
      })

      // Encode the query in the URL path
      const encodedQuery = encodeURIComponent(query)
      const response = await fetch(`${this.baseUrl}/query/${encodedQuery}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LeakCheck API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('LeakCheck query error:', error)
      return {
        success: false,
        found: 0,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get list of available breach sources
   *
   * @returns List of breach sources
   */
  async getSources(): Promise<LeakCheckSourcesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sources?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`LeakCheck API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('LeakCheck sources error:', error)
      return {
        success: false,
        sources: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get public breach info (limited results)
   *
   * @param query - Email or username to check
   * @returns Public breach check result
   */
  async publicCheck(query: string): Promise<{ found: boolean; sources?: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/public?key=${this.apiKey}&check=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        return { found: false }
      }

      const data = await response.json()
      return {
        found: data.found > 0,
        sources: data.sources || 0,
      }
    } catch (error) {
      console.error('LeakCheck public check error:', error)
      return { found: false }
    }
  }
}

/**
 * Create LeakCheck client instance
 */
export function createLeakCheckClient(): LeakCheckClient | null {
  const apiKey = process.env.LEAKCHECK_API_KEY || '07e3de32338e52b47f419c9962e50bb1d1a6d152'

  if (!apiKey) {
    console.warn('LeakCheck API key not configured')
    return null
  }

  return new LeakCheckClient(apiKey)
}
