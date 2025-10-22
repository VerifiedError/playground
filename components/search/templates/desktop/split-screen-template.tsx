'use client'

/**
 * Split Screen Desktop Template
 *
 * Vertical split with visual/JSON dual view for developers and debugging.
 */

import { useState } from 'react'
import { SearchHeader } from '../../search-header'
import { SearchSettings } from '../../search-settings'
import { CreditBadge } from '../../credit-badge'
import { AIChatOverlayV2 } from '../../ai-chat-overlay-v2'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { SearchSettings as SearchSettingsType } from '../../search-settings'

interface SplitScreenTemplateProps {
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

export function SplitScreenTemplate(props: SplitScreenTemplateProps) {
  const [showAIChat, setShowAIChat] = useState(false)
  const [splitMode, setSplitMode] = useState<'split' | 'full'>('split')

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

      <div className="flex items-center gap-2 px-6 py-2 bg-white border-b border-gray-200">
        <button onClick={() => setSplitMode('split')} className={`px-3 py-1 rounded ${splitMode === 'split' ? 'bg-black text-white' : 'bg-gray-100'}`}>Split View</button>
        <button onClick={() => setSplitMode('full')} className={`px-3 py-1 rounded ${splitMode === 'full' ? 'bg-black text-white' : 'bg-gray-100'}`}>Full View</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={splitMode === 'split' ? 'w-1/2 border-r-2 border-black' : 'w-full'}>
          <div className="h-full overflow-y-auto p-6">
            {props.renderResults()}
          </div>
        </div>

        {splitMode === 'split' && (
          <div className="w-1/2 bg-gray-900 text-white overflow-y-auto p-6">
            <pre className="text-xs">{JSON.stringify(props.results, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
