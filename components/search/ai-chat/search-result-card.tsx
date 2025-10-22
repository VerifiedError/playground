'use client'

/**
 * Search Result Card
 *
 * Collapsible card for displaying search results within AI chat messages.
 * - Type indicators (Web, Images, Places, etc.)
 * - Result count badge
 * - Expandable/collapsible content
 * - Clean card design with black borders
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Image as ImageIcon, Video, MapPin, Newspaper, GraduationCap, ShoppingBag } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'
import { WebResults } from '../web-results'
import { ImageResults } from '../image-results'
import { VideoResults } from '../video-results'
import { PlacesResults } from '../places-results'
import { NewsResults } from '../news-results'
import { ScholarResults } from '../scholar-results'
import { ShoppingResults } from '../shopping-results'

interface SearchResultCardProps {
  searchType: string
  searchResults: any
  resultCount?: number
}

const SEARCH_TYPE_CONFIG = {
  search: { icon: Search, label: 'Web Results', color: 'text-blue-600' },
  images: { icon: ImageIcon, label: 'Image Results', color: 'text-purple-600' },
  videos: { icon: Video, label: 'Video Results', color: 'text-red-600' },
  places: { icon: MapPin, label: 'Places', color: 'text-green-600' },
  maps: { icon: MapPin, label: 'Maps', color: 'text-green-600' },
  news: { icon: Newspaper, label: 'News', color: 'text-orange-600' },
  scholar: { icon: GraduationCap, label: 'Scholar', color: 'text-indigo-600' },
  shopping: { icon: ShoppingBag, label: 'Shopping', color: 'text-pink-600' },
} as const

export function SearchResultCard({
  searchType,
  searchResults,
  resultCount,
}: SearchResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const config = SEARCH_TYPE_CONFIG[searchType as keyof typeof SEARCH_TYPE_CONFIG] || SEARCH_TYPE_CONFIG.search
  const Icon = config.icon

  // Count results
  const count = resultCount ||
    searchResults?.organic?.length ||
    searchResults?.images?.length ||
    searchResults?.videos?.length ||
    searchResults?.places?.length ||
    searchResults?.news?.length ||
    0

  return (
    <div className="w-full mt-3 border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div className="text-left">
            <h4 className="text-sm font-bold text-gray-900">{config.label}</h4>
            <p className="text-xs text-gray-600">{count} result{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Results - Collapsible */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
          {renderResults(searchType as SerperSearchType, searchResults)}
        </div>
      )}
    </div>
  )
}

/**
 * Render results based on search type
 */
function renderResults(searchType: SerperSearchType, data: any) {
  if (!data) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        No results available
      </div>
    )
  }

  switch (searchType) {
    case 'search':
      return <WebResults data={data} />
    case 'images':
      return <ImageResults data={data} />
    case 'videos':
      return <VideoResults data={data} />
    case 'places':
    case 'maps':
      return <PlacesResults data={data} />
    case 'news':
      return <NewsResults data={data} />
    case 'scholar':
      return <ScholarResults data={data} />
    case 'shopping':
      return <ShoppingResults data={data} />
    default:
      return <div className="text-sm text-gray-600">Unsupported search type</div>
  }
}
