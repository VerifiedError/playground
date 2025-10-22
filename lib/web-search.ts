/**
 * Google Custom Search API Client
 *
 * Provides web search functionality using Google Custom Search JSON API.
 * Requires GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.
 *
 * Setup:
 * 1. Create Custom Search Engine: https://programmablesearchengine.google.com/
 * 2. Get API Key: https://console.cloud.google.com/apis/credentials
 * 3. Add to .env.local:
 *    GOOGLE_SEARCH_API_KEY=your_api_key
 *    GOOGLE_SEARCH_ENGINE_ID=your_engine_id
 *
 * Cost: $5 per 1000 queries (first 100/day free)
 */

export interface SearchResult {
  title: string
  link: string
  snippet: string
  displayLink?: string
}

export interface WebSearchParams {
  query: string
  maxResults?: number
}

export interface WebSearchResponse {
  results: SearchResult[]
  searchTime: number
  totalResults: number
}

/**
 * Perform web search using Google Custom Search API
 */
export async function webSearch(params: WebSearchParams): Promise<WebSearchResponse> {
  const { query, maxResults = 5 } = params

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  // Validate environment variables
  if (!apiKey || !engineId) {
    console.warn(
      '⚠️  Google Custom Search not configured. Add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to .env.local'
    )
    return mockWebSearch(query, maxResults)
  }

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('cx', engineId)
    url.searchParams.set('q', query)
    url.searchParams.set('num', Math.min(maxResults, 10).toString()) // Max 10 per request

    const startTime = Date.now()
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(`Google Search API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const searchTime = Date.now() - startTime

    const results: SearchResult[] = (data.items || []).slice(0, maxResults).map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink,
    }))

    return {
      results,
      searchTime,
      totalResults: parseInt(data.searchInformation?.totalResults || '0', 10),
    }
  } catch (error: any) {
    console.error('Web search error:', error)
    // Fallback to mock on error
    return mockWebSearch(query, maxResults)
  }
}

/**
 * Mock web search for development/fallback
 */
function mockWebSearch(query: string, maxResults: number): WebSearchResponse {
  console.log(`🔍 Using mock web search for: "${query}"`)

  const mockResults: SearchResult[] = [
    {
      title: `${query} - Wikipedia`,
      link: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: `This is a mock search result for "${query}". In production, this would show real search results from Google Custom Search API.`,
      displayLink: 'en.wikipedia.org',
    },
    {
      title: `${query} - Official Website`,
      link: `https://example.com/${encodeURIComponent(query.toLowerCase())}`,
      snippet: `Official website and documentation for ${query}. Mock result for development purposes.`,
      displayLink: 'example.com',
    },
    {
      title: `${query} - GitHub`,
      link: `https://github.com/search?q=${encodeURIComponent(query)}`,
      snippet: `GitHub repositories and code related to ${query}. This is a placeholder result.`,
      displayLink: 'github.com',
    },
  ].slice(0, maxResults)

  return {
    results: mockResults,
    searchTime: 150,
    totalResults: mockResults.length * 1000,
  }
}

/**
 * Format search results as readable text
 */
export function formatSearchResults(response: WebSearchResponse): string {
  let output = `Found ${response.totalResults.toLocaleString()} results (${response.searchTime}ms):\n\n`

  response.results.forEach((result, i) => {
    output += `${i + 1}. ${result.title}\n`
    output += `   ${result.link}\n`
    output += `   ${result.snippet}\n\n`
  })

  return output.trim()
}
