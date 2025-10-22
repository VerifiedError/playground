/**
 * Search History Management
 *
 * Stores recent searches in localStorage with timestamps.
 * Maintains a maximum of 50 recent searches.
 */

export interface SearchHistoryEntry {
  query: string
  type: string // SerperSearchType
  timestamp: number
}

const STORAGE_KEY = 'search-history'
const MAX_HISTORY_SIZE = 50

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const history = JSON.parse(stored) as SearchHistoryEntry[]
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch {
    return []
  }
}

/**
 * Add a search to history
 */
export function addToSearchHistory(query: string, type: string): void {
  if (typeof window === 'undefined') return
  if (!query.trim()) return

  const history = getSearchHistory()

  // Remove duplicates (same query + type)
  const filtered = history.filter(
    (entry) => !(entry.query.toLowerCase() === query.toLowerCase().trim() && entry.type === type)
  )

  // Add new entry at the beginning
  const newEntry: SearchHistoryEntry = {
    query: query.trim(),
    type,
    timestamp: Date.now(),
  }

  filtered.unshift(newEntry)

  // Keep only the most recent MAX_HISTORY_SIZE entries
  const trimmed = filtered.slice(0, MAX_HISTORY_SIZE)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save search history:', error)
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear search history:', error)
  }
}

/**
 * Remove a specific entry from history
 */
export function removeFromSearchHistory(query: string, type: string): void {
  if (typeof window === 'undefined') return

  const history = getSearchHistory()
  const filtered = history.filter(
    (entry) => !(entry.query.toLowerCase() === query.toLowerCase() && entry.type === type)
  )

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove from search history:', error)
  }
}
