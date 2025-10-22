'use client'

/**
 * Floating Panels Desktop Template
 *
 * VS Code-style draggable and dockable panels for custom workflows.
 */

import { useState } from 'react'
import { SearchHeader } from '../../search-header'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface FloatingPanelsTemplateProps {
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

export function FloatingPanelsTemplate(props: FloatingPanelsTemplateProps) {
  const [showAIChat, setShowAIChat] = useState(false)

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

      <div className="flex-1 relative overflow-hidden">
        {/* Main content */}
        <div className="h-full overflow-y-auto p-6">
          {props.renderResults()}
        </div>

        {/* Floating panels placeholder - would use react-grid-layout in full implementation */}
        <div className="absolute bottom-4 right-4 bg-white border-2 border-black rounded-lg shadow-xl p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Draggable Panel</div>
          <div className="text-xs text-gray-600">Drag to reposition</div>
        </div>
      </div>
    </div>
  )
}
