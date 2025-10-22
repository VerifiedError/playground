'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Trash2, Eye, MessageSquare, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Session {
  id: string
  name?: string | null
  model?: string | null
  messageCount: number
  totalCost: number
  inputTokens: number
  outputTokens: number
  cachedTokens: number
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    username?: string | null
  } | null
}

export function SessionManagementTab() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'cost' | 'messages'>('recent')

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/sessions')

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions || [])
      toast.success('Sessions loaded')
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      toast.success('Session deleted successfully')
      fetchSessions() // Refresh list
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Failed to delete session')
    }
  }

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter((session) =>
      (session.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (session.user?.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (session.model?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.totalCost - a.totalCost
        case 'messages':
          return b.messageCount - a.messageCount
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Session Management
          <span className="ml-2 text-sm text-gray-600 font-normal">
            ({filteredSessions.length} sessions)
          </span>
        </h3>
        <button
          onClick={fetchSessions}
          className="flex items-center justify-center gap-2 px-4 py-3 text-base bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black transition-colors min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-black rounded-lg bg-white text-gray-900 text-base focus:ring-2 focus:ring-gray-900 min-h-[44px]"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 border-2 border-black rounded-lg bg-white text-gray-900 text-base min-h-[44px]"
        >
          <option value="recent">Most Recent</option>
          <option value="cost">Highest Cost</option>
          <option value="messages">Most Messages</option>
        </select>
      </div>

      {/* Desktop Table (≥ md) */}
      <div className="hidden md:block bg-white rounded-lg border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-black">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                    {searchQuery ? 'No sessions match your search' : 'No sessions found'}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900 font-medium line-clamp-1">
                            {session.name || 'Untitled Session'}
                          </p>
                          <p className="text-xs text-gray-600 font-mono">
                            {session.id?.slice(0, 8) || 'unknown'}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {session.user?.username || 'Unknown User'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {session.model || 'Unknown Model'}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {session.messageCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          session.totalCost > 0.1
                            ? 'text-red-600'
                            : session.totalCost > 0.01
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        ${session.totalCost.toFixed(4)}
                      </span>
                      <p className="text-xs text-gray-600">
                        {(session.inputTokens + session.outputTokens).toLocaleString()} tokens
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white border-2 border-black rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-base text-gray-600">
              {searchQuery ? 'No sessions match your search' : 'No sessions found'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border-2 border-black rounded-lg p-4"
            >
              {/* Session Name */}
              <div className="flex items-start gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-gray-900 mb-1 line-clamp-2">
                    {session.name || 'Untitled Session'}
                  </p>
                  <p className="text-xs text-gray-600 font-mono">
                    ID: {session.id?.slice(0, 12) || 'unknown'}...
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-600 text-xs mb-0.5">User</p>
                  <p className="font-medium text-gray-900">{session.user?.username || 'Unknown User'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-0.5">Messages</p>
                  <p className="font-medium text-gray-900">{session.messageCount || 0}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-xs mb-0.5">Model</p>
                  <p className="font-medium text-gray-900 font-mono text-xs break-all">
                    {session.model || 'Unknown Model'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-0.5">Cost</p>
                  <p className={`font-bold text-sm ${
                    session.totalCost > 0.1
                      ? 'text-red-600'
                      : session.totalCost > 0.01
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    ${session.totalCost.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {(session.inputTokens + session.outputTokens).toLocaleString()} tokens
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-0.5">Updated</p>
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteSession(session.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 border-2 border-red-500 rounded-lg hover:bg-red-100 transition-colors min-h-[44px] text-base font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Session
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredSessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-black">
            <p className="text-sm text-gray-600 font-medium">
              Total Messages
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredSessions.reduce((sum, s) => sum + s.messageCount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-black">
            <p className="text-sm text-gray-600 font-medium">
              Total Cost
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ${filteredSessions.reduce((sum, s) => sum + s.totalCost, 0).toFixed(4)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-black">
            <p className="text-sm text-gray-600 font-medium">
              Total Tokens
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredSessions
                .reduce((sum, s) => sum + s.inputTokens + s.outputTokens, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
