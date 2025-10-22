/**
 * Serper.dev API Client
 *
 * Provides type-safe access to Serper.dev Google Search API.
 * Supports 8 search types: web, images, videos, places, maps, news, scholar, shopping.
 */

import type {
  SerperSearchType,
  SerperRequest,
  SerperResponse,
  WebSearchResponse,
  ImageSearchResponse,
  VideoSearchResponse,
  PlacesSearchResponse,
  MapsSearchResponse,
  NewsSearchResponse,
  ScholarSearchResponse,
  ShoppingSearchResponse,
  SerperError,
} from './serper-types'

// Serper.dev API configuration
const SERPER_BASE_URL = 'https://google.serper.dev'
const SERPER_API_KEY = process.env.SERPER_API_KEY || ''

// Endpoint mapping
const ENDPOINTS: Record<SerperSearchType, string> = {
  search: '/search',
  images: '/images',
  videos: '/videos',
  places: '/places',
  maps: '/maps',
  news: '/news',
  scholar: '/scholar',
  shopping: '/shopping',
}

/**
 * Perform a search using Serper.dev API
 *
 * @param type - Type of search (web, images, videos, etc.)
 * @param params - Search parameters
 * @returns Search results
 */
export async function searchSerper(
  type: SerperSearchType,
  params: SerperRequest
): Promise<SerperResponse> {
  const endpoint = ENDPOINTS[type]
  const url = `${SERPER_BASE_URL}${endpoint}`

  // Validate API key
  if (!SERPER_API_KEY) {
    throw new Error('SERPER_API_KEY environment variable is not set')
  }

  // Validate required parameters
  if (!params.q || params.q.trim().length === 0) {
    throw new Error('Query parameter "q" is required and cannot be empty')
  }

  // Validate num parameter
  if (params.num && (params.num < 1 || params.num > 100)) {
    throw new Error('num parameter must be between 1 and 100')
  }

  // Build request body
  const requestBody: Record<string, any> = {
    q: params.q.trim(),
  }

  if (params.num) requestBody.num = params.num
  if (params.gl) requestBody.gl = params.gl
  if (params.hl) requestBody.hl = params.hl
  if (params.tbs) requestBody.tbs = params.tbs
  if (params.autocorrect !== undefined) requestBody.autocorrect = params.autocorrect
  if (params.location) requestBody.location = params.location
  if (params.page) requestBody.page = params.page

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData: SerperError = await response.json()
      throw new Error(
        errorData.error?.message || `Serper API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return data as SerperResponse
  } catch (error: any) {
    console.error('Serper API error:', error)
    throw new Error(error.message || 'Failed to fetch search results')
  }
}

/**
 * Perform a web search
 */
export async function searchWeb(params: SerperRequest): Promise<WebSearchResponse> {
  return searchSerper('search', params) as Promise<WebSearchResponse>
}

/**
 * Perform an image search
 */
export async function searchImages(params: SerperRequest): Promise<ImageSearchResponse> {
  return searchSerper('images', params) as Promise<ImageSearchResponse>
}

/**
 * Perform a video search
 */
export async function searchVideos(params: SerperRequest): Promise<VideoSearchResponse> {
  return searchSerper('videos', params) as Promise<VideoSearchResponse>
}

/**
 * Perform a places search
 */
export async function searchPlaces(params: SerperRequest): Promise<PlacesSearchResponse> {
  return searchSerper('places', params) as Promise<PlacesSearchResponse>
}

/**
 * Perform a maps search
 */
export async function searchMaps(params: SerperRequest): Promise<MapsSearchResponse> {
  return searchSerper('maps', params) as Promise<MapsSearchResponse>
}

/**
 * Perform a news search
 */
export async function searchNews(params: SerperRequest): Promise<NewsSearchResponse> {
  return searchSerper('news', params) as Promise<NewsSearchResponse>
}

/**
 * Perform a scholar search
 */
export async function searchScholar(params: SerperRequest): Promise<ScholarSearchResponse> {
  return searchSerper('scholar', params) as Promise<ScholarSearchResponse>
}

/**
 * Perform a shopping search
 */
export async function searchShopping(params: SerperRequest): Promise<ShoppingSearchResponse> {
  return searchSerper('shopping', params) as Promise<ShoppingSearchResponse>
}

/**
 * Get country codes supported by Serper
 */
export const COUNTRY_CODES = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'br', name: 'Brazil' },
  { code: 'in', name: 'India' },
  { code: 'jp', name: 'Japan' },
  { code: 'cn', name: 'China' },
  { code: 'kr', name: 'South Korea' },
  { code: 'mx', name: 'Mexico' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'pl', name: 'Poland' },
] as const

/**
 * Get language codes supported by Serper
 */
export const LANGUAGE_CODES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
] as const

/**
 * Time filter options
 */
export const TIME_FILTERS = [
  { value: '', label: 'Any time' },
  { value: 'qdr:h', label: 'Past hour' },
  { value: 'qdr:d', label: 'Past 24 hours' },
  { value: 'qdr:w', label: 'Past week' },
  { value: 'qdr:m', label: 'Past month' },
  { value: 'qdr:y', label: 'Past year' },
] as const

/**
 * Calculate estimated cost for a search
 * Based on $1.00 per 1,000 queries (lowest tier)
 *
 * @param queryCount - Number of queries
 * @returns Estimated cost in dollars
 */
export function calculateSearchCost(queryCount: number): number {
  const costPerThousand = 1.0 // $1.00 per 1,000 queries
  return (queryCount / 1000) * costPerThousand
}
