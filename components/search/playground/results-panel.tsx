'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import type { PlaygroundFilters } from '@/app/search/playground/page'
import { JsonViewer } from './json-viewer'
import { GuiResults } from './gui-results'
import { DownloadButton } from './download-button'
import { CreditsDisplay } from './credits-display'
import { AIChatTab } from './ai-chat-tab'
import { PlaygroundChat } from './playground-chat'

interface ResultsPanelProps {
  results: SerperResponse | null
  searchType: SerperSearchType
  loading: boolean
  duration: number | null
  cached?: boolean
  conversationHistory?: any[]
  onConversationUpdate?: (
    conversationHistory: any[],
    messageCount: number,
    totalTokens: number,
    estimatedCost: number
  ) => void
  filters?: PlaygroundFilters
  onFiltersChange?: (filters: PlaygroundFilters) => void
}

export function ResultsPanel({
  results,
  searchType,
  loading,
  duration,
  cached,
  conversationHistory = [],
  onConversationUpdate,
  filters,
  onFiltersChange,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'code' | 'ai'>('results')

  // Playground mode: Show full AI chat without tabs
  if (searchType === 'playground' && filters && onFiltersChange) {
    return (
      <div className="h-full flex flex-col bg-slate-950">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
              <p className="text-slate-300">Preparing playground...</p>
            </div>
          </div>
        ) : !results ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Playground</h3>
              <p className="text-slate-400 text-sm">
                Click Search to start your AI playground session
              </p>
            </div>
          </div>
        ) : (
          <PlaygroundChat
            query={results?.searchParameters?.q || ''}
            filters={filters}
            onFiltersChange={onFiltersChange}
            initialConversationHistory={conversationHistory}
            onConversationUpdate={onConversationUpdate}
          />
        )}
      </div>
    )
  }

  // Standard search modes: Show tabs
  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header with Tabs - Compact on mobile */}
      <div className="border-b-2 border-slate-700 bg-slate-900 flex items-center justify-between px-2 py-1.5 sm:px-6 sm:py-3 flex-shrink-0">
        {/* Tabs - Smaller on mobile */}
        <div className="flex gap-1 sm:gap-4">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors relative ${
              activeTab === 'results'
                ? 'text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Results
            {activeTab === 'results' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors relative ${
              activeTab === 'code'
                ? 'text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON
            {activeTab === 'code' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-1 sm:gap-2 ${
              activeTab === 'ai'
                ? 'text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">AI Chat</span>
            <span className="xs:hidden">AI</span>
            {activeTab === 'ai' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
            )}
          </button>
        </div>

        {/* Right side: Duration, Cached Badge, Download, Credits - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Duration */}
          {duration !== null && (
            <span className="text-sm text-slate-400">
              Duration: <span className="text-white font-medium">{Math.round(duration)}ms</span>
            </span>
          )}

          {/* Cached Badge */}
          {cached && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-900/30 border border-green-500/30 rounded text-xs font-medium text-green-400">
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
              CACHED
            </span>
          )}

          {/* Download Button */}
          {results && <DownloadButton results={results} />}

          {/* Credits */}
          <CreditsDisplay />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
              <p className="text-slate-300">Searching...</p>
            </div>
          </div>
        ) : !results ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No results yet</h3>
              <p className="text-slate-400 text-sm">
                Enter a query and click Search to see results
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {activeTab === 'results' ? (
              <GuiResults results={results} searchType={searchType} />
            ) : activeTab === 'code' ? (
              <JsonViewer data={results} />
            ) : searchType === 'playground' && filters && onFiltersChange ? (
              <PlaygroundChat
                query={results?.searchParameters?.q || ''}
                filters={filters}
                onFiltersChange={onFiltersChange}
                initialConversationHistory={conversationHistory}
                onConversationUpdate={onConversationUpdate}
              />
            ) : (
              <AIChatTab
                searchResults={results}
                searchType={searchType}
                initialConversationHistory={conversationHistory}
                onConversationUpdate={onConversationUpdate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
