'use client'

/**
 * Research Hub Desktop Template
 *
 * Three-panel workspace with filters, results, and preview.
 * Notion/Linear inspired layout for deep research and academic use.
 */

import { useState } from 'react'
import { Search, Settings, Bot, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { SearchHeader } from '../../search-header'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface ResearchHubTemplateProps {
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

export function ResearchHubTemplate(props: ResearchHubTemplateProps) {
  const [showAIChat, setShowAIChat] = useState(false)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)

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

      {/* Header */}
      <SearchHeader
        query={props.inputQuery}
        onQueryChange={props.onQueryChange}
        onSearch={props.onSearch}
        searchType={props.searchType}
        onSearchTypeChange={props.onTabChange}
        onSettingsClick={props.onSettingsClick}
      />

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Filters */}
        <div className={`bg-white border-r-2 border-black transition-all ${showLeftPanel ? 'w-64' : 'w-0'}`}>
          {showLeftPanel && (
            <div className="h-full overflow-y-auto p-4">
              <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
              {/* Filters content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Results: {props.filters.num}</label>
                  <input type="range" min="10" max="100" value={props.filters.num} onChange={(e) => props.onFilterChange({ ...props.filters, num: parseInt(e.target.value) })} className="w-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center - Results */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
            <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="p-1 hover:bg-gray-100 rounded">
              {showLeftPanel ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            <span className="text-sm text-gray-600">Research Hub</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {props.renderResults()}
          </div>
        </div>

        {/* Right Sidebar - Preview */}
        <div className={`bg-white border-l-2 border-black transition-all ${showRightPanel ? 'w-96' : 'w-0'}`}>
          {showRightPanel && (
            <div className="h-full overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5" />
                <h3 className="font-bold text-gray-900">Preview</h3>
              </div>
              <p className="text-sm text-gray-600">Select a result to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
