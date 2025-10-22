'use client'

/**
 * Recent Searches Component (Google-style)
 *
 * Displays recent search history below search input.
 * Shown by default, can be toggled in settings.
 */

import { useState, useEffect } from 'react'
import { Clock, X, Trash2 } from 'lucide-react'
import { getSearchHistory, removeFromSearchHistory, clearSearchHistory, type SearchHistoryEntry } from '@/lib/search-history'
import type { SerperSearchType } from '@/lib/serper-types'

interface RecentSearchesProps {
  onSearchClick: (query: string, type: SerperSearchType) => void
  show?: boolean
}

const SEARCH_TYPE_LABELS: Record<string, string> = {
  search: 'Web',
  images: 'Images',
  videos: 'Videos',
  places: 'Places',
  maps: 'Maps',
  news: 'News',
  scholar: 'Scholar',
  shopping: 'Shopping',
}

export function RecentSearches({ onSearchClick, show = true }: RecentSearchesProps) {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    if (show) {
      setHistory(getSearchHistory())
    }
  }, [show])

  if (!show || history.length === 0) return null

  function handleRemove(entry: SearchHistoryEntry, e: React.MouseEvent) {
    e.stopPropagation()
    removeFromSearchHistory(entry.query, entry.type)
    setHistory(getSearchHistory())
  }

  function handleClearAll() {
    clearSearchHistory()
    setHistory([])
    setShowClearConfirm(false)
  }

  // Show only the most recent 5 searches on mobile, 10 on desktop
  const recentSearches = history.slice(0, 5)

  return (
    <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <h3 className="text-xs font-semibold text-gray-700">Recent</h3>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          Clear
        </button>
      </div>

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
          <p className="text-xs text-gray-900">Clear all?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-2 py-1 text-xs font-medium text-white bg-black rounded hover:bg-gray-800"
            >
              Yes
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Compact Search List */}
      <div className="divide-y divide-gray-100">
        {recentSearches.map((entry, index) => (
          <button
            key={`${entry.query}-${entry.type}-${index}`}
            onClick={() => onSearchClick(entry.query, entry.type as SerperSearchType)}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-gray-900 truncate">{entry.query}</p>
              <p className="text-xs text-gray-500">
                {SEARCH_TYPE_LABELS[entry.type]} • {formatTimestamp(entry.timestamp)}
              </p>
            </div>
            <button
              onClick={(e) => handleRemove(entry, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity flex-shrink-0"
              aria-label="Remove"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
