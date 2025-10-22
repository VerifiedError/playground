'use client'

/**
 * Search Header Component
 *
 * Logo, search input, and search button.
 * On mobile: Compact header with search type dropdown.
 * On desktop: Full header with logo.
 */

import Link from 'next/link'
import { Search, Mic, Globe, Image, Video, MapPin, Map, Newspaper, GraduationCap, ShoppingCart, Settings } from 'lucide-react'
import { APP_NAME } from '@/lib/version'
import type { SerperSearchType } from '@/lib/serper-types'

interface SearchHeaderProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (e: React.FormEvent) => void
  searchType: SerperSearchType
  onSearchTypeChange: (type: SerperSearchType) => void
  onSettingsClick: () => void
}

const SEARCH_TYPE_ICONS = {
  search: Globe,
  images: Image,
  videos: Video,
  places: MapPin,
  maps: Map,
  news: Newspaper,
  scholar: GraduationCap,
  shopping: ShoppingCart,
} as const

export function SearchHeader({ query, onQueryChange, onSearch, searchType, onSearchTypeChange, onSettingsClick }: SearchHeaderProps) {
  return (
    <header className="border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Logo - Always visible, smaller on mobile */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            {APP_NAME}
          </Link>

          {/* Search Form */}
          <form onSubmit={onSearch} className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search the web..."
                  className="w-full pl-4 pr-24 py-3 border-2 border-black rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 text-base min-h-[48px]"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                {/* Settings and Mic icons INSIDE input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSettingsClick}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label="Search settings"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label="Voice search"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-4 md:px-6 py-3 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[48px] min-w-[48px]"
              >
                <Search className="h-5 w-5" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  )
}
