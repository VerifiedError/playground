'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Search, Clock, MessageSquare, Coins, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PlaygroundSession {
  id: string
  title: string | null
  searchQuery: string
  searchType: string
  messageCount: number
  totalTokens: number
  estimatedCost: number
  createdAt: string
  updatedAt: string
}

interface SessionSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSessionSelect: (sessionId: string) => void
  currentSessionId?: string | null
}

// Group sessions by date
function groupSessionsByDate(sessions: PlaygroundSession[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const groups: Record<string, PlaygroundSession[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    Older: [],
  }

  sessions.forEach((session) => {
    const sessionDate = new Date(session.createdAt)
    if (sessionDate >= today) {
      groups.Today.push(session)
    } else if (sessionDate >= yesterday) {
      groups.Yesterday.push(session)
    } else if (sessionDate >= lastWeek) {
      groups['Last 7 Days'].push(session)
    } else {
      groups.Older.push(session)
    }
  })

  return groups
}

// Get icon for search type
function getSearchTypeIcon(searchType: string) {
  switch (searchType) {
    case 'search':
      return '🔍'
    case 'images':
      return '🖼️'
    case 'videos':
      return '🎥'
    case 'places':
      return '📍'
    case 'maps':
      return '🗺️'
    case 'news':
      return '📰'
    case 'scholar':
      return '🎓'
    case 'shopping':
      return '🛒'
    default:
      return '🔍'
  }
}

export function SessionSidebar({
  isOpen,
  onClose,
  onSessionSelect,
  currentSessionId,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<PlaygroundSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch sessions on mount
  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/search/playground/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent session selection

    if (!confirm('Delete this session? This cannot be undone.')) {
      return
    }

    try {
      setDeletingId(sessionId)
      const response = await fetch(`/api/search/playground/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      } else {
        alert('Failed to delete session')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const groupedSessions = groupSessionsByDate(sessions)

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-slate-900 border-r-2 border-slate-700 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-[85vw] max-w-[400px]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-700 bg-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Search History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No search history yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Your searches will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([group, groupSessions]) => {
                if (groupSessions.length === 0) return null

                return (
                  <div key={group}>
                    {/* Group Header */}
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                      {group}
                    </h3>

                    {/* Sessions in Group */}
                    <div className="space-y-2">
                      {groupSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => handleSessionClick(session.id)}
                          className={`
                            group relative px-3 py-3 rounded-lg border-2 cursor-pointer transition-all
                            ${
                              currentSessionId === session.id
                                ? 'bg-purple-500/20 border-purple-500'
                                : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
                            }
                          `}
                        >
                          {/* Session Title */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-lg flex-shrink-0 mt-0.5">
                              {getSearchTypeIcon(session.searchType)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">
                                {session.title || session.searchQuery}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatDistanceToNow(new Date(session.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0 mt-1" />
                          </div>

                          {/* Session Stats */}
                          <div className="flex items-center gap-3 text-xs text-slate-400 ml-7">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{session.messageCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              <span>${session.estimatedCost.toFixed(3)}</span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDelete(session.id, e)}
                            disabled={deletingId === session.id}
                            className="
                              absolute top-2 right-2
                              p-1.5 rounded-md
                              bg-slate-800 border border-slate-700
                              hover:bg-red-500 hover:border-red-500
                              transition-colors
                              opacity-0 group-hover:opacity-100
                            "
                            aria-label="Delete session"
                          >
                            {deletingId === session.id ? (
                              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 text-white" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-700 px-6 py-3 bg-slate-800">
          <div className="text-xs text-slate-400">
            <p className="font-semibold text-white mb-1">
              {sessions.length} {sessions.length === 1 ? 'search' : 'searches'}
            </p>
            <p>
              Total cost: $
              {sessions
                .reduce((sum, s) => sum + s.estimatedCost, 0)
                .toFixed(3)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
