/**
 * Academic Research Template
 *
 * Dense layout optimized for scholarly research.
 * Features: Citation tools, filters, paper metadata, advanced search.
 * Best for: Researchers, students, academic work.
 */

'use client'

import { Search, BookOpen, Filter, Settings, FileText, Quote } from 'lucide-react'
import { CompactFilters } from '../../compact-filters'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface AcademicTemplateProps {
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

const ACADEMIC_TABS = [
  { id: 'scholar', label: 'Scholar', icon: BookOpen },
  { id: 'search', label: 'Web', icon: Search },
  { id: 'news', label: 'News', icon: FileText },
]

export function AcademicTemplate({
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
}: AcademicTemplateProps) {
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

      {/* Compact Academic Header */}
      <header className="bg-white border-b-2 border-gray-300 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-700" />
              <div className="text-xl font-bold text-gray-900">Academic Search</div>
            </div>

            {/* Search Bar - Compact */}
            <form onSubmit={onSearch} className="flex-1 max-w-3xl">
              <div className="relative">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search scholarly articles, papers, and citations..."
                  className="w-full pl-4 pr-10 py-2 border-2 border-gray-300 rounded-md bg-white hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </form>

            {/* Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToolsClick}
                className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium relative"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white" />
                )}
              </button>
              <button
                onClick={onSettingsClick}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs - Compact */}
          <div className="flex items-center gap-2 mt-2">
            {ACADEMIC_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as SerperSearchType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                    searchType === tab.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Two-Column Layout */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex gap-4">
        {/* Left Sidebar - Filters & Tools */}
        {query && results && (
          <aside className="w-64 flex-shrink-0 space-y-3">
            {/* Citation Tool Card */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="h-4 w-4 text-blue-700" />
                <h3 className="font-semibold text-sm text-gray-900">Citation Tools</h3>
              </div>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-xs text-gray-700">
                  Export as BibTeX
                </button>
                <button className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-xs text-gray-700">
                  Copy APA Citation
                </button>
                <button className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-xs text-gray-700">
                  Save to Library
                </button>
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-3">
              <h3 className="font-semibold text-sm text-gray-900 mb-2">Refine Results</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Date Range</label>
                  <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs">
                    <option>Any time</option>
                    <option>Past year</option>
                    <option>Past 5 years</option>
                    <option>Past 10 years</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Sort by</label>
                  <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs">
                    <option>Relevance</option>
                    <option>Date (newest)</option>
                    <option>Citations</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Results - Dense Layout */}
        <main className="flex-1 min-w-0">
          {renderResults()}
        </main>
      </div>
    </div>
  )
}
