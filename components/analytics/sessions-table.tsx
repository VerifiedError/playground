'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatCost } from '@/lib/cost-calculator'

interface Session {
  id: string
  name: string
  model: string
  messageCount: number
  totalCost: number
  createdAt: string
}

interface SessionsTableProps {
  sessions: Session[]
  onSessionClick: (sessionId: string) => void
}

type SortKey = 'name' | 'model' | 'messageCount' | 'totalCost' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function SessionsTable({ sessions, onSessionClick }: SessionsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new key with descending as default (most recent/highest first)
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    let compareValue = 0

    switch (sortKey) {
      case 'name':
        compareValue = a.name.localeCompare(b.name)
        break
      case 'model':
        compareValue = a.model.localeCompare(b.model)
        break
      case 'messageCount':
        compareValue = a.messageCount - b.messageCount
        break
      case 'totalCost':
        compareValue = a.totalCost - b.totalCost
        break
      case 'createdAt':
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return sortDirection === 'asc' ? compareValue : -compareValue
  })

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sessions yet. Start a conversation to see analytics.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 font-semibold text-gray-900 hover:text-black transition-colors"
              >
                Session
                <SortIcon columnKey="name" />
              </button>
            </th>
            <th className="px-3 py-2 text-left">
              <button
                onClick={() => handleSort('model')}
                className="flex items-center gap-1 font-semibold text-gray-900 hover:text-black transition-colors"
              >
                Model
                <SortIcon columnKey="model" />
              </button>
            </th>
            <th className="px-3 py-2 text-left">
              <button
                onClick={() => handleSort('messageCount')}
                className="flex items-center gap-1 font-semibold text-gray-900 hover:text-black transition-colors"
              >
                Msgs
                <SortIcon columnKey="messageCount" />
              </button>
            </th>
            <th className="px-3 py-2 text-left">
              <button
                onClick={() => handleSort('totalCost')}
                className="flex items-center gap-1 font-semibold text-gray-900 hover:text-black transition-colors"
              >
                Cost
                <SortIcon columnKey="totalCost" />
              </button>
            </th>
            <th className="px-3 py-2 text-left">
              <button
                onClick={() => handleSort('createdAt')}
                className="flex items-center gap-1 font-semibold text-gray-900 hover:text-black transition-colors"
              >
                Date
                <SortIcon columnKey="createdAt" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedSessions.map((session) => (
            <tr
              key={session.id}
              onClick={() => onSessionClick(session.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-3 py-2 font-medium text-gray-900 truncate max-w-[200px]">
                {session.name}
              </td>
              <td className="px-3 py-2 text-gray-600 truncate max-w-[150px]">
                {session.model}
              </td>
              <td className="px-3 py-2 text-gray-600">
                {session.messageCount}
              </td>
              <td className="px-3 py-2">
                <span className={
                  session.totalCost < 0.01 ? 'text-green-600' :
                  session.totalCost < 0.10 ? 'text-yellow-600' :
                  'text-red-600'
                }>
                  {formatCost(session.totalCost)}
                </span>
              </td>
              <td className="px-3 py-2 text-gray-500">
                {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
