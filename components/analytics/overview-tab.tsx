'use client'

import { MessageSquare, DollarSign, Coins, TrendingUp, Zap, Calendar, Trophy } from 'lucide-react'
import { StatCard } from './stat-card'
import { MicroChart } from './micro-chart'
import { formatCost } from '@/lib/cost-calculator'

interface OverviewTabProps {
  totalSessions: number
  totalCost: number
  totalTokens: number
  avgCostPerSession: number
  costByDate: Array<{ date: string; cost: number }>
  costByModel: Array<{ model: string; cost: number; count: number }>
  recentSessions: Array<{
    id: string
    name: string
    totalCost: number
  }>
}

export function OverviewTab({
  totalSessions,
  totalCost,
  totalTokens,
  avgCostPerSession,
  costByDate,
  costByModel,
  recentSessions
}: OverviewTabProps) {
  // Format tokens with K/M suffix
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
    return tokens.toLocaleString()
  }

  // Get cost color
  const getCostColor = (cost: number) => {
    if (cost < 0.5) return 'text-green-600 dark:text-green-400'
    if (cost < 2.0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Find insights
  const mostUsedModel = costByModel.length > 0 ? costByModel[0] : null
  const highestCostSession = recentSessions.length > 0
    ? recentSessions.reduce((max, s) => s.totalCost > max.totalCost ? s : max, recentSessions[0])
    : null

  // Calculate this week's data
  const last7Days = costByDate.slice(-7)
  const thisWeekCost = last7Days.reduce((sum, d) => sum + d.cost, 0)
  const thisWeekSessions = last7Days.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Stats Grid (2x2) */}
      <div className="flex-shrink-0 p-3">
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Sessions"
            value={totalSessions.toString()}
            icon={MessageSquare}
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            label="Total Cost"
            value={formatCost(totalCost)}
            icon={DollarSign}
            color={getCostColor(totalCost)}
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            label="Tokens"
            value={formatTokens(totalTokens)}
            icon={Coins}
            color="text-purple-600 dark:text-purple-400"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            label="Avg/Session"
            value={formatCost(avgCostPerSession)}
            icon={TrendingUp}
            color="text-orange-600 dark:text-orange-400"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
        {/* This Week Snapshot - Compact */}
        <div className="border-2 border-black rounded-lg p-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Last 7 Days
            </h3>
            <p className={`text-xs font-bold ${getCostColor(thisWeekCost)}`}>
              {formatCost(thisWeekCost)}
            </p>
          </div>

          {last7Days.length > 0 ? (
            <MicroChart
              data={last7Days.map(d => ({ date: d.date, value: d.cost }))}
              height={60}
              color="#000000"
            />
          ) : (
            <div className="h-16 flex items-center justify-center text-gray-500 text-xs">
              No data for last 7 days
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Sessions</p>
              <p className="font-bold text-sm">{thisWeekSessions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Avg/Day</p>
              <p className="font-bold text-sm">{formatCost(thisWeekCost / 7)}</p>
            </div>
          </div>
        </div>

        {/* Quick Insights - Compact Grid */}
        <div>
          <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Quick Insights
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {mostUsedModel && (
              <div className="border-2 border-black rounded-lg p-2 bg-white">
                <p className="text-xs text-gray-600 mb-0.5">Top Model</p>
                <p className="font-bold text-xs truncate">{mostUsedModel.model.split('/').pop()}</p>
                <p className="text-xs text-gray-500">{mostUsedModel.count} uses</p>
              </div>
            )}
            {highestCostSession && (
              <div className="border-2 border-black rounded-lg p-2 bg-white">
                <p className="text-xs text-gray-600 mb-0.5">Highest Cost</p>
                <p className="font-bold text-xs truncate">{highestCostSession.name}</p>
                <p className={`text-xs ${getCostColor(highestCostSession.totalCost)}`}>
                  {formatCost(highestCostSession.totalCost)}
                </p>
              </div>
            )}
            <div className="border-2 border-black rounded-lg p-2 bg-white">
              <p className="text-xs text-gray-600 mb-0.5">This Week</p>
              <p className="font-bold text-lg">{thisWeekSessions}</p>
              <p className="text-xs text-gray-500">{formatCost(thisWeekCost)}</p>
            </div>
            <div className="border-2 border-black rounded-lg p-2 bg-white">
              <p className="text-xs text-gray-600 mb-0.5">Messages</p>
              <p className="font-bold text-lg">{totalSessions * 2}</p>
              <p className="text-xs text-gray-500">Approx</p>
            </div>
          </div>
        </div>

        {/* Achievement Badge - Compact */}
        {totalSessions >= 10 && (
          <div className="border-2 border-black rounded-lg p-3 bg-green-50">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Trophy className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-xs text-gray-900">Achievement!</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {totalSessions} sessions completed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
