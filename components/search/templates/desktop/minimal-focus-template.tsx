'use client'

/**
 * Minimal Focus Desktop Template
 *
 * Centered single-column distraction-free layout for focused reading and accessibility.
 */

import { useState } from 'react'
import { SearchHeader } from '../../search-header'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface MinimalFocusTemplateProps {
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

export function MinimalFocusTemplate(props: MinimalFocusTemplateProps) {
  const [showAIChat, setShowAIChat] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="sticky top-0 z-10 bg-white border-b-2 border-black">
        <SearchHeader
          query={props.inputQuery}
          onQueryChange={props.onQueryChange}
          onSearch={props.onSearch}
          searchType={props.searchType}
          onSearchTypeChange={props.onTabChange}
          onSettingsClick={props.onSettingsClick}
        />
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {props.renderResults()}
      </div>
    </div>
  )
}
