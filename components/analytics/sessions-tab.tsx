'use client'

import { useState } from 'react'
import { MessageSquare, ChevronDown, Filter } from 'lucide-react'
import { formatCost } from '@/lib/cost-calculator'

// Native JavaScript date formatting (replaced date-fns to fix webpack circular dependency)
const formatDistanceToNow = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? '' : 's'} ago`
}

interface Session {
  id: string
  name: string
  model: string
  messageCount: number
  totalCost: number
  createdAt: string
}

interface SessionsTabProps {
  sessions: Session[]
  onSessionClick: (sessionId: string) => void
}

type SortOption = 'recent' | 'cost' | 'messages' | 'tokens'
type FilterOption = 'all' | 'today' | 'week' | 'month'

export function SessionsTab({ sessions, onSessionClick }: SessionsTabProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Get cost color
  const getCostColor = (cost: number) => {
    if (cost < 0.01) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    if (cost < 0.10) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  }

  // Filter sessions by time
  const filterSessions = (sessions: Session[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (filterBy) {
      case 'today':
        return sessions.filter(s => new Date(s.createdAt) >= today)
      case 'week':
        return sessions.filter(s => new Date(s.createdAt) >= weekAgo)
      case 'month':
        return sessions.filter(s => new Date(s.createdAt) >= monthAgo)
      default:
        return sessions
    }
  }

  // Sort sessions
  const sortSessions = (sessions: Session[]) => {
    const sorted = [...sessions]
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'cost':
        return sorted.sort((a, b) => b.totalCost - a.totalCost)
      case 'messages':
        return sorted.sort((a, b) => b.messageCount - a.messageCount)
      default:
        return sorted
    }
  }

  const filteredSessions = sortSessions(filterSessions(sessions))

  if (sessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No sessions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start a conversation to see it here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters & Sort Bar */}
      <div className="p-3 border-b-2 border-black bg-card flex items-center gap-2">
        {/* Sort Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => {
              setShowSortMenu(!showSortMenu)
              setShowFilterMenu(false)
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 border-2 border-black rounded-lg bg-card hover:bg-accent transition-colors"
          >
            <span className="text-sm font-medium">
              {sortBy === 'recent' && 'Recent'}
              {sortBy === 'cost' && 'Highest Cost'}
              {sortBy === 'messages' && 'Most Messages'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 border-2 border-black rounded-lg bg-card shadow-lg z-50 overflow-hidden transition-all duration-200">
                {(['recent', 'cost', 'messages'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option)
                      setShowSortMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                      sortBy === option ? 'bg-primary/10 font-medium' : ''
                    }`}
                  >
                    {option === 'recent' && 'Most Recent'}
                    {option === 'cost' && 'Highest Cost'}
                    {option === 'messages' && 'Most Messages'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu)
              setShowSortMenu(false)
            }}
            className={`flex items-center gap-1 px-3 py-2 border-2 border-black rounded-lg bg-card hover:bg-accent transition-colors ${
              filterBy !== 'all' ? 'bg-primary/10' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">
              {filterBy === 'all' && 'All'}
              {filterBy === 'today' && 'Today'}
              {filterBy === 'week' && 'Week'}
              {filterBy === 'month' && 'Month'}
            </span>
          </button>

          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute top-full right-0 mt-1 border-2 border-black rounded-lg bg-card shadow-lg z-50 overflow-hidden min-w-[120px] transition-all duration-200">
                {(['all', 'today', 'week', 'month'] as FilterOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterBy(option)
                      setShowFilterMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                      filterBy === option ? 'bg-primary/10 font-medium' : ''
                    }`}
                  >
                    {option === 'all' && 'All Time'}
                    {option === 'today' && 'Today'}
                    {option === 'week' && 'This Week'}
                    {option === 'month' && 'This Month'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No sessions found for this filter</p>
          </div>
        ) : (
          filteredSessions.map((session, index) => (
            <button
              key={session.id}
              onClick={() => onSessionClick(session.id)}
              className="w-full border-2 border-black rounded-lg p-3 bg-card hover:bg-accent transition-all hover:shadow-md text-left"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{session.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                    {session.model}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${getCostColor(session.totalCost)}`}>
                  {formatCost(session.totalCost)}
                </div>
              </div>

              {/* Session Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{session.messageCount} msgs</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(session.createdAt))}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Results Summary */}
      <div className="p-3 border-t-2 border-black bg-card">
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </p>
      </div>
    </div>
  )
}
