'use client'

/**
 * Serper.dev Playground
 *
 * Developer-focused playground for testing all 8 Serper search types.
 * Features JSON and GUI result views with comprehensive filter controls.
 * Uses desktop layout for all devices (mobile-responsive).
 */

export const dynamic = 'force-dynamic'

import { useState, Suspense, useEffect } from 'react'
import { Loader2, Menu, Clock } from 'lucide-react'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import { FilterPanel } from '@/components/search/playground/filter-panel'
import { ResultsPanel } from '@/components/search/playground/results-panel'
import { MobileFilterDrawer } from '@/components/search/playground/mobile-filter-drawer'
import { SessionSidebar } from '@/components/search/playground/session-sidebar'
import { QuickActions } from '@/components/mobile/quick-actions'
import { mobileToast } from '@/lib/mobile-toast'
import { checkCreditLimit, recordSearchUsage } from '@/lib/credit-manager'

export interface PlaygroundFilters {
  // Common filters
  num: number
  gl: string
  hl: string
  page: number

  // Search-specific
  tbs?: string
  location?: string
  autocorrect?: boolean

  // Maps-specific
  gps?: string  // @latitude,longitude,zoom
  placeId?: string
  cid?: string

  // LeakCheck-specific
  queryType?: 'email' | 'username' | 'domain' | 'phone' | 'hash' | 'auto'
  emailKeywordSearch?: boolean

  // Playground-specific (AI chat)
  selectedModel?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  enableTools?: boolean
}

function PlaygroundPageContent() {
  // State
  const [searchType, setSearchType] = useState<SerperSearchType>('search')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<PlaygroundFilters>({
    num: 10,
    gl: 'us',
    hl: 'en',
    page: 1,
    autocorrect: true,
  })
  const [results, setResults] = useState<SerperResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const [cached, setCached] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Session management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSessionSidebar, setShowSessionSidebar] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])

  /**
   * Create or update session after search
   */
  async function saveSession(searchResults: SerperResponse) {
    try {
      if (currentSessionId) {
        // Update existing session with new results
        await fetch(`/api/search/playground/sessions/${currentSessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchResults,
            filters,
          }),
        })
      } else {
        // Create new session
        const response = await fetch('/api/search/playground/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchQuery: query,
            searchType,
            filters,
            searchResults,
            selectedModel: 'groq/compound', // Default model
          }),
        })

        if (response.ok) {
          const newSession = await response.json()
          setCurrentSessionId(newSession.id)
        }
      }
    } catch (error) {
      console.error('Error saving session:', error)
      // Don't show error to user - session saving is optional
    }
  }

  /**
   * Restore session from history
   */
  async function restoreSession(sessionId: string) {
    try {
      const response = await fetch(`/api/search/playground/sessions/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to load session')
      }

      const session = await response.json()

      // Restore all state
      setCurrentSessionId(session.id)
      setQuery(session.searchQuery)
      setSearchType(session.searchType as SerperSearchType)
      setFilters(session.filters || {
        num: 10,
        gl: 'us',
        hl: 'en',
        page: 1,
        autocorrect: true,
      })
      setResults(session.searchResults)
      setConversationHistory(session.conversationHistory || [])

      mobileToast.success('Session restored!')
    } catch (error) {
      console.error('Error restoring session:', error)
      mobileToast.error('Failed to restore session')
    }
  }

  /**
   * Update conversation history in session
   */
  async function updateConversationHistory(
    conversationHistory: any[],
    messageCount: number,
    totalTokens: number,
    estimatedCost: number
  ) {
    if (!currentSessionId) return

    try {
      await fetch(`/api/search/playground/sessions/${currentSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory,
          messageCount,
          totalTokens,
          estimatedCost,
        }),
      })
    } catch (error) {
      console.error('Error updating conversation:', error)
    }
  }

  /**
   * Perform search via API
   */
  async function performSearch() {
    if (!query.trim()) {
      mobileToast.error('Please enter a search query')
      return
    }

    // Playground type: Skip Serper API, create AI chat session instead
    if (searchType === 'playground') {
      if (!filters.selectedModel) {
        mobileToast.error('Please select an AI model first')
        return
      }

      setLoading(true)
      const startTime = performance.now()

      try {
        // Create mock PlaygroundResponse for session storage
        const playgroundResults: any = {
          searchParameters: {
            q: query,
            model: filters.selectedModel,
            type: 'playground',
          },
          messages: [],
        }

        const endTime = performance.now()
        setDuration(endTime - startTime)
        setResults(playgroundResults)

        // Save session with playground type
        await saveSession(playgroundResults)

        // Close mobile drawer
        setShowMobileFilters(false)

        mobileToast.success('Playground session ready! Switch to AI Chat tab.')
      } catch (error) {
        console.error('Playground error:', error)
        mobileToast.error(error instanceof Error ? error.message : 'Failed to start playground')
      } finally {
        setLoading(false)
      }
      return
    }

    // Check credit limits (for Serper searches only)
    const creditCheck = checkCreditLimit(filters.num, false)
    if (!creditCheck.allowed) {
      mobileToast.error(creditCheck.reason || 'Search blocked by credit limit')
      return
    }

    setLoading(true)
    const startTime = performance.now()

    try {
      // Transform query for LeakCheck email keyword search
      let searchQuery = query.trim()
      if (searchType === 'leakcheck' && filters.emailKeywordSearch) {
        // Automatically append @*.* for wildcard email searches
        // Only if query doesn't already contain @ symbol
        if (!searchQuery.includes('@')) {
          searchQuery = `${searchQuery}@*.*`
        }
      }

      // Build query params for Serper API
      const params = new URLSearchParams({
        type: searchType,
        q: searchQuery,
        num: filters.num.toString(),
        gl: filters.gl,
        hl: filters.hl,
        page: filters.page.toString(),
      })

      // Add optional filters
      if (filters.tbs) params.append('tbs', filters.tbs)
      if (filters.location) params.append('location', filters.location)
      if (filters.autocorrect !== undefined) {
        params.append('autocorrect', filters.autocorrect.toString())
      }
      if (filters.gps) params.append('gps', filters.gps)
      if (filters.placeId) params.append('placeId', filters.placeId)
      if (filters.cid) params.append('cid', filters.cid)
      if (filters.queryType) params.append('queryType', filters.queryType)

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      const endTime = performance.now()
      setDuration(data.metadata?.duration || (endTime - startTime))
      setCached(data.metadata?.cached || false)

      // Extract the actual Serper results from the API wrapper
      setResults(data.results)

      // Save session (auto-save)
      await saveSession(data.results)

      // Record usage
      await recordSearchUsage(filters.num)

      // Close mobile drawer after search
      setShowMobileFilters(false)

    } catch (error) {
      console.error('Search error:', error)
      mobileToast.error(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden border-b-2 border-slate-700 bg-slate-900 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setShowSessionSidebar(true)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors border-2 border-slate-700"
          aria-label="Open history"
        >
          <Clock className="h-4 w-4 text-purple-400" />
        </button>
        <h1 className="text-base font-bold text-white">Playground</h1>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors border-2 border-slate-700"
          aria-label="Open filters"
        >
          <Menu className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Desktop Layout (used for all devices) */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left: Filter Panel (Fixed width) */}
        <div className="w-[400px] border-r-2 border-slate-700 bg-slate-900 flex-shrink-0 overflow-y-auto">
          <FilterPanel
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={performSearch}
            loading={loading}
          />
        </div>

        {/* Right: Results Panel (Flexible) */}
        <div className="flex-1 overflow-hidden">
          <ResultsPanel
            results={results}
            searchType={searchType}
            loading={loading}
            duration={duration}
            cached={cached}
            conversationHistory={conversationHistory}
            onConversationUpdate={updateConversationHistory}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* Mobile Layout (same as desktop, responsive) */}
      <div className="lg:hidden flex-1 overflow-hidden">
        <ResultsPanel
          results={results}
          searchType={searchType}
          loading={loading}
          duration={duration}
          cached={cached}
          conversationHistory={conversationHistory}
          onConversationUpdate={updateConversationHistory}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={performSearch}
        loading={loading}
      />

      {/* Loading overlay for mobile */}
      {loading && (
        <div className="lg:hidden fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-slate-900 rounded-lg p-6 border-2 border-slate-700">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300">Searching...</p>
          </div>
        </div>
      )}

      {/* Session History Sidebar */}
      <SessionSidebar
        isOpen={showSessionSidebar}
        onClose={() => setShowSessionSidebar(false)}
        onSessionSelect={restoreSession}
        currentSessionId={currentSessionId}
      />

      {/* Quick Actions (Mobile only) */}
      <QuickActions />
    </div>
  )
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="h-[100dvh] flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading playground...</p>
        </div>
      </div>
    }>
      <PlaygroundPageContent />
    </Suspense>
  )
}
