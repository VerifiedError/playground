'use client'

import { Cpu, MessageSquare, DollarSign, Trophy } from 'lucide-react'
import { formatCost } from '@/lib/cost-calculator'

interface ModelsTabProps {
  costByModel: Array<{
    model: string
    cost: number
    count: number
  }>
  totalCost: number
  totalSessions: number
}

export function ModelsTab({ costByModel, totalCost, totalSessions }: ModelsTabProps) {
  // Get cost color
  const getCostColor = (cost: number) => {
    if (cost < 0.5) return 'text-green-600 dark:text-green-400'
    if (cost < 2.0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Get model badge color based on type
  const getModelBadgeColor = (modelName: string) => {
    if (modelName.includes('llama-4')) return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
    if (modelName.includes('llama-3.3')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
    if (modelName.includes('llama-3.2')) return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
    if (modelName.includes('llama-3.1')) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
    if (modelName.includes('compound')) return 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
    return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
  }

  // Most popular model
  const mostPopular = costByModel.length > 0 ? costByModel[0] : null

  if (costByModel.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No model data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-safe">
      {/* Most Popular Model Banner */}
      {mostPopular && (
        <div className="border-2 border-primary/50 rounded-lg p-4 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Most Used Model</p>
              <p className="font-mono text-sm mt-1 truncate">{mostPopular.model}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{mostPopular.count} sessions</span>
                <span>•</span>
                <span className={getCostColor(mostPopular.cost)}>{formatCost(mostPopular.cost)}</span>
                <span>•</span>
                <span>{((mostPopular.count / totalSessions) * 100).toFixed(0)}% usage</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Usage Grid */}
      <div>
        <h3 className="text-sm font-semibold mb-3">All Models</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {costByModel.map((model, index) => {
            const usagePercentage = totalSessions > 0 ? (model.count / totalSessions) * 100 : 0
            const costPercentage = totalCost > 0 ? (model.cost / totalCost) * 100 : 0
            const avgCostPerSession = model.count > 0 ? model.cost / model.count : 0

            return (
              <div
                key={model.model}
                className="border-2 border-black rounded-lg p-3 bg-card hover:shadow-md transition-all duration-300"
                style={{ opacity: 1 }}
              >
                {/* Model name with badge */}
                <div className="mb-3">
                  <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${getModelBadgeColor(model.model)}`}>
                    {model.model.includes('llama-4') ? 'Llama 4' :
                     model.model.includes('llama-3.3') ? 'Llama 3.3' :
                     model.model.includes('llama-3.2') ? 'Llama 3.2' :
                     model.model.includes('llama-3.1') ? 'Llama 3.1' :
                     model.model.includes('compound') ? 'Compound' : 'Other'}
                  </div>
                  <p className="font-mono text-xs truncate text-muted-foreground">
                    {model.model}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p className="font-bold text-sm">{model.count}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded">
                      <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className={`font-bold text-sm ${getCostColor(model.cost)}`}>
                        {formatCost(model.cost)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Usage %</span>
                    <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cost Share</span>
                    <span className="font-medium">{costPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        model.cost < 0.5 ? 'bg-green-500' :
                        model.cost < 2.0 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${costPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Avg/Session</span>
                    <span className={`font-medium ${getCostColor(avgCostPerSession)}`}>
                      {formatCost(avgCostPerSession)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Model Comparison Summary */}
      <div className="border-2 border-black rounded-lg p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Quick Comparison</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Models Used</span>
            <span className="font-bold">{costByModel.length}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Most Expensive</span>
            <div className="text-right">
              <p className="font-mono text-xs truncate max-w-[150px]">
                {costByModel[0]?.model}
              </p>
              <p className={`text-xs font-bold ${getCostColor(costByModel[0]?.cost || 0)}`}>
                {formatCost(costByModel[0]?.cost || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Most Economical</span>
            <div className="text-right">
              <p className="font-mono text-xs truncate max-w-[150px]">
                {costByModel[costByModel.length - 1]?.model}
              </p>
              <p className="text-xs font-bold text-green-600 dark:text-green-400">
                {formatCost(costByModel[costByModel.length - 1]?.cost || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
