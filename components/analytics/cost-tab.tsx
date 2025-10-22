'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, Clock, ChevronRight, X } from 'lucide-react'
import { MicroChart } from './micro-chart'
import { formatCost } from '@/lib/cost-calculator'

interface CostTabProps {
  totalCost: number
  costByDate: Array<{ date: string; cost: number }>
  costByModel: Array<{ model: string; cost: number; count: number }>
}

export function CostTab({ totalCost, costByDate, costByModel }: CostTabProps) {
  const [showAllModels, setShowAllModels] = useState(false)

  // Get cost color
  const getCostColor = (cost: number) => {
    if (cost < 0.5) return 'text-green-600 dark:text-green-400'
    if (cost < 2.0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Calculate time-based costs
  const today = new Date().toISOString().split('T')[0]
  const todayCost = costByDate.find(d => d.date === today)?.cost || 0

  const last7Days = costByDate.slice(-7)
  const thisWeekCost = last7Days.reduce((sum, d) => sum + d.cost, 0)

  const last30Days = costByDate.slice(-30)
  const thisMonthCost = last30Days.reduce((sum, d) => sum + d.cost, 0)

  // Get color for sparkline
  const getSparklineColor = (cost: number) => {
    if (cost < 0.5) return 'hsl(142, 71%, 45%)' // Green
    if (cost < 2.0) return 'hsl(45, 93%, 47%)' // Yellow
    return 'hsl(0, 84%, 60%)' // Red
  }

  return (
    <div className="p-4 space-y-6 pb-safe">
      {/* Cost Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Cost Breakdown
        </h3>

        {/* Total Cost */}
        <div className="border-2 border-black rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-1">Total Cost (All Time)</p>
          <p className={`text-4xl font-bold ${getCostColor(totalCost)}`}>
            {formatCost(totalCost)}
          </p>
        </div>

        {/* Time-based costs grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border-2 border-black rounded-lg p-3 bg-card">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <p className={`text-xl font-bold ${getCostColor(todayCost)}`}>
              {formatCost(todayCost)}
            </p>
          </div>

          <div className="border-2 border-black rounded-lg p-3 bg-card">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">7 Days</p>
            </div>
            <p className={`text-xl font-bold ${getCostColor(thisWeekCost)}`}>
              {formatCost(thisWeekCost)}
            </p>
          </div>

          <div className="border-2 border-black rounded-lg p-3 bg-card">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">30 Days</p>
            </div>
            <p className={`text-xl font-bold ${getCostColor(thisMonthCost)}`}>
              {formatCost(thisMonthCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div className="border-2 border-black rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cost Trend (30 Days)
          </h3>
        </div>

        {last30Days.length > 0 ? (
          <MicroChart
            data={last30Days.map(d => ({ date: d.date, value: d.cost }))}
            height={120}
            color={getSparklineColor(thisMonthCost)}
            showGradient={true}
          />
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            No cost data available
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
            <p className="font-bold text-sm">{formatCost(thisMonthCost / 30)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="font-bold text-sm">
              {formatCost(Math.max(...last30Days.map(d => d.cost)))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="font-bold text-sm">
              {formatCost(Math.min(...last30Days.map(d => d.cost)))}
            </p>
          </div>
        </div>
      </div>

      {/* Cost by Model */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Cost by Model</h3>

        <div className="space-y-2">
          {costByModel.slice(0, showAllModels ? undefined : 5).map((model, index) => {
            const percentage = totalCost > 0 ? (model.cost / totalCost) * 100 : 0

            return (
              <div key={model.model} className="border-2 border-black rounded-lg p-3 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{model.model}</p>
                    <p className="text-xs text-muted-foreground">{model.count} sessions</p>
                  </div>
                  <p className={`font-bold text-sm ${getCostColor(model.cost)}`}>
                    {formatCost(model.cost)}
                  </p>
                </div>

                {/* Percentage bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      model.cost < 0.5 ? 'bg-green-500' :
                      model.cost < 2.0 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of total</p>
              </div>
            )
          })}
        </div>

        {costByModel.length > 5 && (
          <button
            onClick={() => setShowAllModels(!showAllModels)}
            className="w-full mt-3 py-2 border-2 border-black rounded-lg bg-card hover:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-sm font-medium">
              {showAllModels ? 'Show Less' : `View All ${costByModel.length} Models`}
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${showAllModels ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Cost Alert (if high) */}
      {totalCost >= 5 && (
        <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-yellow-900 dark:text-yellow-100">
                High Usage Alert
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                You've spent {formatCost(totalCost)} so far. Consider reviewing your usage patterns.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
