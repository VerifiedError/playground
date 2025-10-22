/**
 * DuckDuckGo Desktop Template
 *
 * Privacy-focused search with instant answers.
 * Features: Minimal tracking UI, answer boxes, clean results.
 * Best for: Privacy-conscious users.
 */

'use client'

import { Search, Shield, Settings } from 'lucide-react'
import { CompactFilters } from '../../compact-filters'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface DuckDuckGoTemplateProps {
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

const SEARCH_TABS = [
  { id: 'search', label: 'Web', icon: '🌐' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'videos', label: 'Videos', icon: '🎥' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'maps', label: 'Maps', icon: '🗺️' },
]

export function DuckDuckGoTemplate({
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
}: DuckDuckGoTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Centered search header */}
      <div className={`${query ? 'py-4' : 'py-20'} transition-all duration-300`}>
        <div className="max-w-2xl mx-auto px-6">
          {/* Logo with privacy badge */}
          {!query && (
            <div className="flex flex-col items-center mb-8">
              <div className="text-5xl font-bold text-gray-900 mb-4">DuckDuckGo Style</div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Privacy Protected Search</span>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search without being tracked"
                className="w-full pl-6 pr-14 py-4 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>

          {/* Tabs (only when results exist) */}
          {query && (
            <div className="flex items-center gap-2">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as SerperSearchType)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    searchType === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={onSettingsClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {renderResults()}
      </div>
    </div>
  )
}
