/**
 * Google Desktop Template
 *
 * Traditional Google search desktop layout.
 * Features: Left sidebar filters, centered results, knowledge cards.
 * Best for: Familiar desktop search experience.
 */

'use client'

import { Search, Settings, Filter, Bot } from 'lucide-react'
import { CompactFilters } from '../../compact-filters'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import { RecentSearches } from '../../recent-searches'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface GoogleDesktopTemplateProps {
  query: string
  inputQuery: string
  searchType: SerperSearchType
  results: SerperResponse | null
  loading: boolean
  filters: any
  settings: SearchSettingsType
  showSettings: boolean
  showTools: boolean
  hasActiveFilters: boolean
  onQueryChange: (query: string) => void
  onSearch: (e: React.FormEvent) => void
  onTabChange: (type: SerperSearchType) => void
  onFilterChange: (filters: any) => void
  onSettingsClick: () => void
  onSettingsClose: () => void
  onSettingsChange: (settings: SearchSettingsType) => void
  onToolsClick: () => void
  renderResults: () => React.ReactNode
}

const SEARCH_TYPES = [
  { id: 'search', label: 'All' },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'news', label: 'News' },
  { id: 'maps', label: 'Maps' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'scholar', label: 'Scholar' },
]

export function GoogleDesktopTemplate({
  query,
  inputQuery,
  searchType,
  results,
  loading,
  filters,
  settings,
  showSettings,
  showTools,
  hasActiveFilters,
  onQueryChange,
  onSearch,
  onTabChange,
  onFilterChange,
  onSettingsClick,
  onSettingsClose,
  onSettingsChange,
  onToolsClick,
  renderResults,
}: GoogleDesktopTemplateProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* AI Chat Overlay */}
      <AIChatOverlayV2
        isOpen={false}
        onClose={() => {}}
        initialQuery={inputQuery}
        aiModel={settings.aiSearchModel}
        maxResults={settings.aiSearchMaxResults}
        showReasoning={settings.aiShowReasoning}
      />

      {/* Settings Panel */}
      <SearchSettings
        isOpen={showSettings}
        onClose={onSettingsClose}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />

      {/* Filters Modal */}
      <CompactFilters
        isOpen={showTools}
        onClose={onToolsClick}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* Credit Badge */}
      <CreditBadge onSettingsClick={onSettingsClick} />

      {/* Header with logo and search */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Playground
            </div>

            {/* Search Bar */}
            <form onSubmit={onSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-full hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-blue-600" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToolsClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-label="Filters"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                {hasActiveFilters && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
              <button
                onClick={onSettingsClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Type Tabs */}
          {query && (
            <div className="flex items-center gap-4 mt-4 text-sm">
              {SEARCH_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onTabChange(type.id as SerperSearchType)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    searchType === type.id
                      ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-6">
        {!results && !loading && settings.showRecentSearches && (
          <div className="max-w-xl">
            <RecentSearches
              show={true}
              onSearchClick={(q, t) => {
                onQueryChange(q)
                onTabChange(t)
              }}
            />
          </div>
        )}
        {renderResults()}
      </main>
    </div>
  )
}
