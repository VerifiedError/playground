/**
 * Dashboard Template
 *
 * Analytics-focused layout with metrics and visualizations.
 * Features: Search stats, trending charts, data insights.
 * Best for: Data analysis, search trends, marketing research.
 */

'use client'

import { Search, BarChart3, TrendingUp, Settings, PieChart, Activity } from 'lucide-react'
import { CompactFilters } from '../../compact-filters'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface DashboardTemplateProps {
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

export function DashboardTemplate({
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
}: DashboardTemplateProps) {
  // Mock metrics for demonstration
  const metrics = {
    totalResults: results ? 1000 : 0,
    avgLoadTime: '0.42s',
    relevanceScore: 92,
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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

      {/* Header with Metrics */}
      <header className="bg-gray-800 border-b-2 border-gray-700 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-purple-400" />
              <div className="text-xl font-bold">Search Dashboard</div>
            </div>

            {/* Search Bar */}
            <form onSubmit={onSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search and analyze..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 hover:border-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          {/* Metrics Bar */}
          {query && results && (
            <div className="grid grid-cols-4 gap-4">
              {/* Metric Cards */}
              <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Total Results</span>
                </div>
                <div className="text-2xl font-bold">{metrics.totalResults.toLocaleString()}</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400">Load Time</span>
                </div>
                <div className="text-2xl font-bold">{metrics.avgLoadTime}</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Relevance</span>
                </div>
                <div className="text-2xl font-bold">{metrics.relevanceScore}%</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">Search Type</span>
                </div>
                <div className="text-xl font-bold capitalize">{searchType}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Grid Layout */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {query && results ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Filters & Analytics */}
            <aside className="col-span-3 space-y-4">
              {/* Quick Filters Card */}
              <div className="bg-gray-800 rounded-lg border-2 border-gray-700 p-4">
                <h3 className="font-semibold text-white mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  {['search', 'images', 'videos', 'news'].map((type) => (
                    <button
                      key={type}
                      onClick={() => onTabChange(type as SerperSearchType)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        searchType === type
                          ? 'bg-purple-600 text-white font-medium'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trend Analysis Card */}
              <div className="bg-gray-800 rounded-lg border-2 border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-white">Trend Analysis</h3>
                </div>
                <div className="text-sm text-gray-400">
                  Search volume data will appear here
                </div>
              </div>
            </aside>

            {/* Main Results Column */}
            <main className="col-span-9 bg-gray-800 rounded-lg border-2 border-gray-700 p-6">
              <div className="text-gray-100">
                {renderResults()}
              </div>
            </main>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Activity className="h-16 w-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Ready to Analyze</h2>
            <p className="text-gray-500">Enter a search query to start analyzing results</p>
          </div>
        )}
      </div>
    </div>
  )
}
