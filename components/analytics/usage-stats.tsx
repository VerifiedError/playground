'use client'

import { MessageSquare, DollarSign, Coins, TrendingUp } from 'lucide-react'

interface UsageStatsProps {
  totalSessions: number
  totalCost: number
  totalTokens: number
  avgCostPerSession: number
}

export function UsageStats({ totalSessions, totalCost, totalTokens, avgCostPerSession }: UsageStatsProps) {
  // Determine cost color indicator
  const getCostColor = (cost: number) => {
    if (cost < 0.5) return 'text-green-600 dark:text-green-400'
    if (cost < 2.0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Format cost
  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`
    return `$${cost.toFixed(2)}`
  }

  // Format tokens with K/M suffix
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toLocaleString()
  }

  const stats = [
    {
      label: 'Total Sessions',
      value: totalSessions.toString(),
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Total Cost',
      value: formatCost(totalCost),
      icon: DollarSign,
      color: getCostColor(totalCost),
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Total Tokens',
      value: formatTokens(totalTokens),
      icon: Coins,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Avg Cost/Session',
      value: formatCost(avgCostPerSession),
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="border-2 border-black rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
          </div>
          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </>
  )
}
