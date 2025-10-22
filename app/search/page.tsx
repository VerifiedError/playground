'use client'

/**
 * Search Page
 *
 * Main search interface powered by Serper.dev API.
 * Supports 8 search types: web, images, videos, places, maps, news, scholar, shopping.
 * Uses desktop templates for all devices (mobile-responsive).
 */

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import { SearchHeader } from '@/components/search/search-header'
import { MobileTabs } from '@/components/search/mobile-tabs'
import { CompactFilters } from '@/components/search/compact-filters'
import { WebResults } from '@/components/search/web-results'
import { ImageResults } from '@/components/search/image-results'
import { VideoResults } from '@/components/search/video-results'
import { PlacesResults } from '@/components/search/places-results'
import { MapsResults } from '@/components/search/maps-results'
import { NewsResults } from '@/components/search/news-results'
import { ScholarResults } from '@/components/search/scholar-results'
import { ShoppingResults } from '@/components/search/shopping-results'
import { SearchSettings, useSearchSettings } from '@/components/search/search-settings'
import { CreditBadge } from '@/components/search/credit-badge'
import { RecentSearches } from '@/components/search/recent-searches'
import { checkCreditLimit, recordSearchUsage } from '@/lib/credit-manager'
import { addToSearchHistory } from '@/lib/search-history'
import { mobileToast } from '@/lib/mobile-toast'
import { loadSearchTemplateSettings } from '@/lib/search-template-settings'
import { ResearchHubTemplate } from '@/components/search/templates/desktop/research-hub-template'
import { DashboardViewTemplate } from '@/components/search/templates/desktop/dashboard-view-template'
import { SplitScreenTemplate } from '@/components/search/templates/desktop/split-screen-template'
import { FloatingPanelsTemplate } from '@/components/search/templates/desktop/floating-panels-template'
import { MinimalFocusTemplate } from '@/components/search/templates/desktop/minimal-focus-template'

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Settings
  const { settings, updateSettings } = useSearchSettings()
  const [templateSettings, setTemplateSettings] = useState(loadSearchTemplateSettings())
  const [showSettings, setShowSettings] = useState(false)
  const [showTools, setShowTools] = useState(false)

  // URL parameters
  const queryParam = searchParams.get('q') || ''
  const typeParam = (searchParams.get('type') || 'search') as SerperSearchType

  // State
  const [searchType, setSearchType] = useState<SerperSearchType>(typeParam)
  const [query, setQuery] = useState(queryParam)
  const [inputQuery, setInputQuery] = useState(queryParam)
  const [results, setResults] = useState<SerperResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    num: settings.resultsPerPage,
    gl: 'us',
    hl: 'en',
    tbs: '',
    autocorrect: true,
    location: '',
    page: 1,
  })

  // Perform search when URL params change
  useEffect(() => {
    if (queryParam && queryParam !== query) {
      setQuery(queryParam)
      setInputQuery(queryParam)
      performSearch(queryParam, typeParam)
    }
  }, [queryParam, typeParam])

  /**
   * Perform search via API
   */
  async function performSearch(searchQuery: string, type: SerperSearchType = searchType) {
    if (!searchQuery.trim()) {
      mobileToast.error('Please enter a search query')
      return
    }

    // Check credit limits BEFORE making API call
    const creditCheck = checkCreditLimit(filters.num, false)

    if (!creditCheck.allowed) {
      mobileToast.error(creditCheck.reason || 'Search blocked by credit limit')
      return
    }

    // Show warning if approaching limits (non-strict mode)
    if (creditCheck.warning) {
      mobileToast.warning(creditCheck.warning)
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          q: searchQuery,
          ...filters,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data = await response.json()
      setResults(data.results)

      // Record credit usage AFTER successful search
      recordSearchUsage(filters.num)

      // Add to search history
      addToSearchHistory(searchQuery, type)

      // Update URL
      const params = new URLSearchParams()
      params.set('q', searchQuery)
      params.set('type', type)
      router.push(`/search?${params.toString()}`, { scroll: false })
    } catch (error: any) {
      console.error('Search error:', error)
      mobileToast.error(error.message || 'Failed to perform search')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle search form submission
   */
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (inputQuery.trim()) {
      setQuery(inputQuery)
      performSearch(inputQuery, searchType)
    }
  }

  /**
   * Handle tab change
   */
  function handleTabChange(newType: SerperSearchType) {
    setSearchType(newType)
    // Only auto-search if setting is enabled
    if (query && settings.autoSearchOnTypeChange) {
      performSearch(query, newType)
    }
  }

  /**
   * Handle filter change
   */
  function handleFilterChange(newFilters: typeof filters) {
    setFilters(newFilters)
    // Only auto-search if setting is enabled
    if (query && settings.autoSearchOnFilterChange) {
      performSearch(query, searchType)
    }
  }

  /**
   * Render results
   */
  function renderResults() {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">Searching...</p>
        </div>
      )
    }

    if (!results) {
      return (
        <div className="space-y-4">
          {/* Recent Searches */}
          {settings.showRecentSearches && (
            <div className="max-w-xl mx-auto">
              <RecentSearches
                show={settings.showRecentSearches}
                onSearchClick={(query, type) => {
                  setInputQuery(query)
                  setSearchType(type)
                  performSearch(query, type)
                }}
              />
            </div>
          )}

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-8">
            <Search className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-600 text-base">Enter a query to start searching</p>
            <p className="text-gray-500 text-xs mt-1.5">
              Powered by Serper.dev
            </p>
          </div>
        </div>
      )
    }

    // Render visual results based on search type
    switch (searchType) {
      case 'search':
        return <WebResults data={results as any} />
      case 'images':
        return <ImageResults data={results as any} />
      case 'videos':
        return <VideoResults data={results as any} />
      case 'places':
        return <PlacesResults data={results as any} />
      case 'maps':
        return <MapsResults data={results as any} />
      case 'news':
        return <NewsResults data={results as any} />
      case 'scholar':
        return <ScholarResults data={results as any} />
      case 'shopping':
        return <ShoppingResults data={results as any} />
      default:
        return <div>Unknown search type</div>
    }
  }

  // Check if any filters are active (for Tools indicator)
  const hasActiveFilters =
    filters.num !== 10 ||
    filters.gl !== 'us' ||
    filters.hl !== 'en' ||
    filters.tbs !== '' ||
    filters.autocorrect !== true ||
    filters.location !== '' ||
    filters.page !== 1

  // Template props shared across all templates
  const templateProps = {
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
    onQueryChange: setInputQuery,
    onSearch: handleSearch,
    onTabChange: handleTabChange,
    onFilterChange: handleFilterChange,
    onSettingsClick: () => setShowSettings(true),
    onSettingsClose: () => setShowSettings(false),
    onSettingsChange: updateSettings,
    onToolsClick: () => setShowTools(!showTools),
    renderResults,
    templateSettings,
  }

  // Desktop template routing (used for all devices, mobile-responsive)
  switch (templateSettings.desktopTemplate) {
    case 'dashboard-view':
      return <DashboardViewTemplate {...templateProps} />
    case 'split-screen':
      return <SplitScreenTemplate {...templateProps} />
    case 'floating-panels':
      return <FloatingPanelsTemplate {...templateProps} />
    case 'minimal-focus':
      return <MinimalFocusTemplate {...templateProps} />
    case 'research-hub':
    default:
      return <ResearchHubTemplate {...templateProps} />
  }

  // Legacy fallback layout (should never reach here)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Settings Panel */}
      <SearchSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />

      {/* Tools/Filters Modal */}
      <CompactFilters
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Credit Badge (only shows when > 70% usage) */}
      <CreditBadge onSettingsClick={() => setShowSettings(true)} />

      {/* Header with search bar */}
      <SearchHeader
        query={inputQuery}
        onQueryChange={setInputQuery}
        onSearch={handleSearch}
        searchType={searchType}
        onSearchTypeChange={handleTabChange}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Google-style tabs (always visible) */}
      <MobileTabs
        activeTab={searchType}
        onTabChange={handleTabChange}
        onToolsClick={() => setShowTools(true)}
        showToolsIndicator={hasActiveFilters}
      />

      {/* Results */}
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-6">
        {renderResults()}
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary (required for useSearchParams in Next.js 15)
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
            <p className="text-gray-600">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
