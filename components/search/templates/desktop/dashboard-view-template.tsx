'use client'

/**
 * Dashboard View Desktop Template
 *
 * Analytics dashboard with stats cards, charts, and results grid.
 * Optimized for data analysis and reporting.
 */

import { useState } from 'react'
import { Search, Settings, Bot, BarChart3, Download } from 'lucide-react'
import { SearchHeader } from '../../search-header'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface DashboardViewTemplateProps {
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
  isMobile: boolean
  onQueryChange: (query: string) => void
  onSearch: (e: React.FormEvent) => void
  onTabChange: (type: SerperSearchType) => void
  onFilterChange: (filters: any) => void
  onTemplateChange: any
  onSettingsClick: () => void
  onSettingsClose: () => void
  onSettingsChange: (settings: SearchSettingsType) => void
  onToolsClick: () => void
  renderResults: () => React.ReactNode
}

export function DashboardViewTemplate(props: DashboardViewTemplateProps) {
  const [showAIChat, setShowAIChat] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AIChatOverlayV2
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialQuery={props.inputQuery}
        aiModel={props.settings.aiSearchModel}
        maxResults={props.settings.aiSearchMaxResults}
        showReasoning={props.settings.aiShowReasoning}
      />

      <SearchSettings
        isOpen={props.showSettings}
        onClose={props.onSettingsClose}
        settings={props.settings}
        onSettingsChange={props.onSettingsChange}
      />

      <CreditBadge onSettingsClick={props.onSettingsClick} />

      <SearchHeader
        query={props.inputQuery}
        onQueryChange={props.onQueryChange}
        onSearch={props.onSearch}
        searchType={props.searchType}
        onSearchTypeChange={props.onTabChange}
        onSettingsClick={props.onSettingsClick}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Results</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">1,234</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-sm text-gray-600">Search Time</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">0.5s</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-sm text-gray-600">Filters Active</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{props.hasActiveFilters ? 'Yes' : 'No'}</div>
          </div>
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <div className="text-sm text-gray-600">View Mode</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100'}`}>Grid</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100'}`}>List</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="px-6 pb-6">
          <div className="bg-white border-2 border-black rounded-lg p-6">
            {props.renderResults()}
          </div>
        </div>
      </div>
    </div>
  )
}
