'use client'

import { Coins, ArrowUp, ArrowDown, Zap, TrendingUp } from 'lucide-react'
import { CircularProgress } from './circular-progress'

interface TokensTabProps {
  totalTokens: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCachedTokens: number
  avgTokensPerSession: number
}

export function TokensTab({
  totalTokens,
  totalInputTokens,
  totalOutputTokens,
  totalCachedTokens,
  avgTokensPerSession
}: TokensTabProps) {
  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  // Calculate cache hit rate
  const cacheHitRate = totalTokens > 0
    ? ((totalCachedTokens / totalTokens) * 100).toFixed(1)
    : '0'

  // Estimated messages (rough estimate: avg 100 tokens per message)
  const estimatedMessages = Math.round(totalTokens / 100)

  return (
    <div className="p-4 space-y-6 pb-safe">
      {/* Total Tokens Card */}
      <div className="border-2 border-black rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <p className="text-xs text-muted-foreground">Total Tokens</p>
        </div>
        <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
          {formatNumber(totalTokens)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ~{estimatedMessages.toLocaleString()} messages
        </p>
      </div>

      {/* Token Distribution - Circular Progress */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Token Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <CircularProgress
            value={totalInputTokens}
            max={totalTokens}
            label="Input"
            count={formatNumber(totalInputTokens)}
            color="hsl(221, 83%, 53%)" // Blue
            size={100}
          />
          <CircularProgress
            value={totalOutputTokens}
            max={totalTokens}
            label="Output"
            count={formatNumber(totalOutputTokens)}
            color="hsl(142, 71%, 45%)" // Green
            size={100}
          />
          <CircularProgress
            value={totalCachedTokens}
            max={totalTokens}
            label="Cached"
            count={formatNumber(totalCachedTokens)}
            color="hsl(45, 93%, 47%)" // Yellow
            size={100}
          />
        </div>
      </div>

      {/* Token Efficiency Metrics */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Efficiency Metrics</h3>

        <div className="space-y-3">
          {/* Avg Tokens per Session */}
          <div className="border-2 border-black rounded-lg p-3 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Tokens/Session</p>
                <p className="text-2xl font-bold">{formatNumber(avgTokensPerSession)}</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Avg Tokens per Message */}
          <div className="border-2 border-black rounded-lg p-3 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Tokens/Message</p>
                <p className="text-2xl font-bold">
                  {estimatedMessages > 0 ? formatNumber(Math.round(totalTokens / estimatedMessages)) : '0'}
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Coins className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="border-2 border-black rounded-lg p-3 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {cacheHitRate}%
                </p>
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalCachedTokens > 0
                ? 'Great job utilizing cached tokens!'
                : 'No cached tokens detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Input vs Output Breakdown */}
      <div className="border-2 border-black rounded-lg p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Input vs Output</h3>

        <div className="space-y-3">
          {/* Input Tokens */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium">Input Tokens</p>
              </div>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(totalInputTokens)}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${totalTokens > 0 ? (totalInputTokens / totalTokens) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTokens > 0 ? ((totalInputTokens / totalTokens) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          {/* Output Tokens */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium">Output Tokens</p>
              </div>
              <p className="font-bold text-green-600 dark:text-green-400">
                {formatNumber(totalOutputTokens)}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${totalTokens > 0 ? (totalOutputTokens / totalTokens) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTokens > 0 ? ((totalOutputTokens / totalTokens) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          {/* Cached Tokens */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm font-medium">Cached Tokens</p>
              </div>
              <p className="font-bold text-yellow-600 dark:text-yellow-400">
                {formatNumber(totalCachedTokens)}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${totalTokens > 0 ? (totalCachedTokens / totalTokens) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTokens > 0 ? ((totalCachedTokens / totalTokens) * 100).toFixed(1) : 0}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Cost Savings from Cache */}
      {totalCachedTokens > 0 && (
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-bold text-sm text-green-900 dark:text-green-100">
                Cache Savings
              </p>
              <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                You've cached {formatNumber(totalCachedTokens)} tokens, reducing costs and improving response times!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
