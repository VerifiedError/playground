/**
 * Serper.dev API TypeScript Interfaces
 *
 * Complete type definitions for all Serper.dev search endpoints.
 */

// Search types supported by Serper.dev + Playground
export type SerperSearchType =
  | 'search'      // Web search
  | 'images'      // Image search
  | 'videos'      // Video search
  | 'places'      // Places/local business search
  | 'maps'        // Maps search
  | 'news'        // News articles
  | 'scholar'     // Google Scholar (academic)
  | 'shopping'    // Shopping/products
  | 'playground'  // Pure AI chat (no Serper API)
  | 'leakcheck'   // Breach/leak checking (LeakCheck.io API)

// Time-based search filters
export type SerperTimeFilter =
  | 'qdr:h'  // Past hour
  | 'qdr:d'  // Past 24 hours
  | 'qdr:w'  // Past week
  | 'qdr:m'  // Past month
  | 'qdr:y'  // Past year

// Request parameters
export interface SerperRequest {
  q: string               // Query string (required)
  num?: number            // Number of results (1-100, default 10)
  gl?: string             // Country code (e.g., 'us', 'uk', 'ca')
  hl?: string             // Language code (e.g., 'en', 'es', 'fr')
  tbs?: SerperTimeFilter  // Time-based filter
  autocorrect?: boolean   // Enable autocorrect (default true)
  location?: string       // Specific location for local searches
  page?: number           // Page number for pagination
}

// Common result fields
interface BaseResult {
  position?: number
  title: string
  link: string
}

// Web Search Result
export interface WebSearchResult extends BaseResult {
  snippet?: string
  date?: string
  sitelinks?: Array<{
    title: string
    link: string
  }>
}

// Image Result
export interface ImageResult {
  title: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  thumbnailUrl: string
  thumbnailWidth: number
  thumbnailHeight: number
  source: string
  domain: string
  link: string
  position: number
}

// Video Result
export interface VideoResult extends BaseResult {
  snippet?: string
  channel?: string
  duration?: string
  date?: string
  thumbnail?: string
  views?: string
  platform?: string // 'youtube', 'vimeo', etc.
}

// Place Result
export interface PlaceResult {
  position: number
  title: string
  address?: string
  latitude?: number
  longitude?: number
  rating?: number
  ratingCount?: number
  category?: string
  phoneNumber?: string
  website?: string
  cid?: string
}

// News Result
export interface NewsResult extends BaseResult {
  snippet: string
  date: string
  source: string
  imageUrl?: string
}

// Scholar Result
export interface ScholarResult extends BaseResult {
  snippet: string
  publication?: string
  authors?: string[]
  year?: string
  citedBy?: number
  pdfLink?: string
}

// Shopping Result
export interface ShoppingResult {
  position: number
  title: string
  source: string
  link: string
  price?: string
  thumbnail?: string
  rating?: number
  ratingCount?: number
  delivery?: string
}

// LeakCheck Result (Breach/Leak Data)
export interface LeakCheckResult {
  /** Breach sources where this entry was found */
  sources: Array<{
    name: string
    date: string
  }>
  /** Fields found in breaches */
  fields: string[]
  /** Email address */
  email?: string
  /** Username */
  username?: string
  /** Password (may be hashed or redacted) */
  password?: string
  /** Hash type if password is hashed */
  hash?: string
  /** Full name */
  name?: string
  /** Phone number */
  phone?: string
  /** IP address */
  ip?: string
  /** Raw line data */
  line?: string
  /** Additional breach data fields */
  [key: string]: any
}

// Knowledge Graph
export interface KnowledgeGraph {
  title: string
  type?: string
  description?: string
  descriptionSource?: string
  descriptionLink?: string
  imageUrl?: string
  attributes?: Record<string, string>
}

// Answer Box
export interface AnswerBox {
  snippet?: string
  snippetHighlighted?: string[]
  title?: string
  link?: string
}

// Related Searches
export interface RelatedSearch {
  query: string
}

// People Also Ask
export interface PeopleAlsoAsk {
  question: string
  snippet: string
  title: string
  link: string
}

// Organic results (for web search)
export interface OrganicResult extends WebSearchResult {
  sitelinks?: Array<{
    title: string
    link: string
  }>
}

// Web Search Response
export interface WebSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
    engine?: string
  }
  organic?: OrganicResult[]
  answerBox?: AnswerBox
  knowledgeGraph?: KnowledgeGraph
  relatedSearches?: RelatedSearch[]
  peopleAlsoAsk?: PeopleAlsoAsk[]
  credits?: number
}

// Image Search Response
export interface ImageSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
  }
  images: ImageResult[]
  credits?: number
}

// Video Search Response
export interface VideoSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
  }
  videos: VideoResult[]
  credits?: number
}

// Places Search Response
export interface PlacesSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
  }
  places: PlaceResult[]
  credits?: number
}

// Maps Search Response
export interface MapsSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    type?: string
  }
  places: PlaceResult[]
  credits?: number
}

// News Search Response
export interface NewsSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
  }
  news: NewsResult[]
  credits?: number
}

// Scholar Search Response
export interface ScholarSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
  }
  organic: ScholarResult[]
  credits?: number
}

// Shopping Search Response
export interface ShoppingSearchResponse {
  searchParameters: {
    q: string
    gl?: string
    hl?: string
    num?: number
    type?: string
  }
  shopping: ShoppingResult[]
  credits?: number
}

// Playground Response (pure AI chat, no search results)
export interface PlaygroundResponse {
  searchParameters: {
    q: string
    model: string
    type: 'playground'
  }
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
}

// LeakCheck Search Response (breach/leak check results)
export interface LeakCheckSearchResponse {
  searchParameters: {
    q: string
    type: 'leakcheck'
    queryType?: 'email' | 'username' | 'domain' | 'phone' | 'hash' | 'auto'
  }
  success: boolean
  found: number
  result: LeakCheckResult[] | null
  error?: string
  credits?: number
}

// Union type for all responses
export type SerperResponse =
  | WebSearchResponse
  | ImageSearchResponse
  | VideoSearchResponse
  | PlacesSearchResponse
  | MapsSearchResponse
  | NewsSearchResponse
  | ScholarSearchResponse
  | ShoppingSearchResponse
  | PlaygroundResponse
  | LeakCheckSearchResponse

// Error response
export interface SerperError {
  error: {
    message: string
    type: string
    code?: string
  }
}
