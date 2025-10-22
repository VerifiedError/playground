'use client'

import { Search, Loader2 } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'
import type { PlaygroundFilters } from '@/app/search/playground/page'
import { SearchTypeSelector } from './search-type-selector'
import { DynamicFilters } from './dynamic-filters'
import { ProfileNav } from './profile-nav'

interface FilterPanelProps {
  searchType: SerperSearchType
  onSearchTypeChange: (type: SerperSearchType) => void
  query: string
  onQueryChange: (query: string) => void
  filters: PlaygroundFilters
  onFiltersChange: (filters: PlaygroundFilters) => void
  onSearch: () => void
  loading: boolean
}

export function FilterPanel({
  searchType,
  onSearchTypeChange,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onSearch,
  loading,
}: FilterPanelProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Playground</h1>
        <p className="text-sm text-slate-400">Test Serper.dev search API</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Search Type Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type
          </label>
          <SearchTypeSelector
            value={searchType}
            onChange={onSearchTypeChange}
          />
        </div>

        {/* Query Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Query <span className="text-sky-400">q</span>
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rochester Armored Car Sioux Falls"
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Dynamic Filters based on search type */}
        <DynamicFilters
          searchType={searchType}
          filters={filters}
          onFiltersChange={onFiltersChange}
          loading={loading}
        />

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Search
            </>
          )}
        </button>
      </form>

      {/* Mini-batch toggle (future feature) */}
      <div className="pt-4 border-t border-slate-700">
        <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
          <input
            type="checkbox"
            disabled
            className="w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-500"
          />
          <span className="text-sm text-slate-400">Mini-batch (up to 100 queries)</span>
        </label>
      </div>

      {/* Profile Navigation */}
      <ProfileNav />
    </div>
  )
}
