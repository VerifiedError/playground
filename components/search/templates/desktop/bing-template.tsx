/**
 * Bing Desktop Template
 *
 * Rich media layout with visual cards and sidebar.
 * Features: Image-rich results, trending topics, rewards UI.
 * Best for: Visual browsing, multimedia content.
 */

'use client'

import { Search, TrendingUp, Settings, Image, Video, Newspaper } from 'lucide-react'
import { CompactFilters } from '../../compact-filters'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface BingTemplateProps {
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
  { id: 'search', label: 'All', icon: Search },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'maps', label: 'Maps', icon: TrendingUp },
]

export function BingTemplate({
  query,
  inputQuery,
  searchType,
  results,
  loading,
  filters,
  settings,
  showSettings,
  showTools,
  onQueryChange,
  onSearch,
  onTabChange,
  onFilterChange,
  onSettingsClick,
  onSettingsClose,
  onSettingsChange,
  onToolsClick,
  renderResults,
}: BingTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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

      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bing Style
            </div>

            {/* Search Bar */}
            <form onSubmit={onSearch} className="flex-1 max-w-3xl">
              <div className="relative">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search the web..."
                  className="w-full pl-6 pr-14 py-3.5 border-2 border-gray-300 rounded-full bg-white/90 hover:bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Tabs */}
          {query && (
            <div className="flex items-center gap-1 mt-3">
              {SEARCH_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => onTabChange(type.id as SerperSearchType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      searchType === type.id
                        ? 'bg-white text-blue-600 font-medium shadow-sm border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex gap-6">
        {/* Results Column */}
        <main className="flex-1 min-w-0">
          {renderResults()}
        </main>

        {/* Right Sidebar - Trending/Recommendations */}
        {query && results && (
          <aside className="w-80 flex-shrink-0 space-y-4">
            {/* Trending Topics Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Trending Topics</h3>
              </div>
              <div className="space-y-2">
                {['AI Technology', 'Climate News', 'Sports Updates', 'Tech Reviews'].map((topic) => (
                  <button
                    key={topic}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Related Searches Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Related Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Learn more', 'Tutorial', 'Guide', 'Tips'].map((related) => (
                  <button
                    key={related}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
                  >
                    {related}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
