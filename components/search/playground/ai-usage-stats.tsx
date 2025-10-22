'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Coins, Activity, TrendingUp, RotateCcw } from 'lucide-react'
import { loadUsageStats, formatCost, formatTokens, resetUsageStats, type UsageStats } from '@/lib/ai-chat-usage-tracker'

interface AIUsageStatsProps {
  onReset?: () => void
}

export function AIUsageStats({ onReset }: AIUsageStatsProps) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Load stats on mount
    setStats(loadUsageStats())

    // Refresh stats every 5 seconds
    const interval = setInterval(() => {
      setStats(loadUsageStats())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const hasUsage = stats.totalMessages > 0

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all usage statistics? This cannot be undone.')) {
      resetUsageStats()
      setStats(loadUsageStats())
      onReset?.()
    }
  }

  return (
    <div className="border-t-2 border-slate-700 bg-slate-900/50 px-3 sm:px-6 py-1.5 sm:py-2">
      {/* Compact Stats - Single Line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-400" />
            <span className="hidden sm:inline text-xs text-slate-400">Messages:</span>
            <span className="text-xs font-semibold text-white">{stats.totalMessages}</span>
          </div>

          <div className="flex items-center gap-1">
            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-400" />
            <span className="hidden sm:inline text-xs text-slate-400">Tokens:</span>
            <span className="text-xs font-semibold text-white">{formatTokens(stats.totalTokens)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Coins className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400" />
            <span className="hidden sm:inline text-xs text-slate-400">Cost:</span>
            <span className="text-xs font-semibold text-white">{formatCost(stats.estimatedCost)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {hasUsage && (
            <button
              onClick={handleReset}
              className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-red-400"
              title="Reset statistics"
            >
              <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          )}
          {hasUsage && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              {showDetails ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetails && hasUsage && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Breakdown</span>
            <span className="text-xs text-slate-500">
              {stats.userMessages} sent · {stats.aiMessages} received
            </span>
          </div>
          <div className="space-y-1">
            {Object.entries(stats.modelsUsed)
              .sort((a, b) => b[1] - a[1])
              .map(([model, count]) => {
                const percentage = (count / stats.aiMessages) * 100
                return (
                  <div key={model} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-40 truncate" title={model}>{model}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-12 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
