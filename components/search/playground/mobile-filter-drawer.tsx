'use client'

import { useEffect } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'
import type { PlaygroundFilters } from '@/app/search/playground/page'
import { SearchTypeSelector } from './search-type-selector'
import { DynamicFilters } from './dynamic-filters'
import { ProfileNav } from './profile-nav'

interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  searchType: SerperSearchType
  onSearchTypeChange: (type: SerperSearchType) => void
  query: string
  onQueryChange: (query: string) => void
  filters: PlaygroundFilters
  onFiltersChange: (filters: PlaygroundFilters) => void
  onSearch: () => void
  loading: boolean
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  searchType,
  onSearchTypeChange,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onSearch,
  loading,
}: MobileFilterDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t-2 border-slate-700 rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Dynamic Filters */}
            <DynamicFilters
              searchType={searchType}
              filters={filters}
              onFiltersChange={onFiltersChange}
              loading={loading}
            />
          </form>

          {/* Profile Navigation */}
          <ProfileNav />
        </div>

        {/* Footer with Search Button */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0 bg-slate-900">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSearch()
              }}
              disabled={loading || !query.trim()}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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
          </div>
        </div>
      </div>
    </>
  )
}
