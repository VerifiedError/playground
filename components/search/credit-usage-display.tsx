'use client'

/**
 * Credit Usage Display Component
 *
 * Shows current API usage statistics with visual progress bars.
 * Displays daily and monthly limits with color-coded warnings.
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Calendar, DollarSign, Settings } from 'lucide-react'
import {
  getCreditUsage,
  getCreditLimits,
  getUsagePercentage,
  estimateMonthlyCost,
  type CreditUsage,
  type CreditLimits,
} from '@/lib/credit-manager'

interface CreditUsageDisplayProps {
  compact?: boolean
  onSettingsClick?: () => void
}

export function CreditUsageDisplay({ compact = false, onSettingsClick }: CreditUsageDisplayProps) {
  const [usage, setUsage] = useState<CreditUsage | null>(null)
  const [limits, setLimits] = useState<CreditLimits | null>(null)

  useEffect(() => {
    setUsage(getCreditUsage())
    setLimits(getCreditLimits())
  }, [])

  if (!usage || !limits) return null

  const dailySearchPct = getUsagePercentage(usage.dailySearches, limits.maxDailySearches)
  const dailyResultsPct = getUsagePercentage(usage.dailyResults, limits.maxDailyResults)
  const monthlySearchPct = getUsagePercentage(usage.monthlySearches, limits.maxMonthlySearches)
  const monthlyResultsPct = getUsagePercentage(usage.monthlyResults, limits.maxMonthlyResults)

  const monthlyCost = estimateMonthlyCost(usage.monthlySearches)

  function getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'bg-red-600'
    if (percentage >= 70) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  function getTextColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-gray-600'
  }

  // Compact mode - single line summary
  if (compact) {
    const highestPct = Math.max(dailySearchPct, dailyResultsPct, monthlySearchPct, monthlyResultsPct)
    const isWarning = highestPct >= 70

    return (
      <div className="flex items-center gap-3 px-3 py-2 border-2 border-black rounded-lg bg-white">
        {isWarning && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Today:</span>
          <span className={`font-semibold ${getTextColor(dailySearchPct)}`}>
            {usage.dailySearches}/{limits.maxDailySearches}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Month:</span>
          <span className={`font-semibold ${getTextColor(monthlySearchPct)}`}>
            {usage.monthlySearches}/{limits.maxMonthlySearches}
          </span>
        </div>
        {onSettingsClick && (
          <>
            <div className="h-4 w-px bg-gray-300" />
            <button
              onClick={onSettingsClick}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Credit settings"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>
          </>
        )}
      </div>
    )
  }

  // Full mode - detailed statistics
  return (
    <div className="border-2 border-black rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-black px-4 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-gray-900" />
          <h3 className="font-bold text-gray-900">API Usage</h3>
          {limits.strictMode && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
              STRICT MODE
            </span>
          )}
        </div>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="px-3 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Settings</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Daily Usage */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-bold text-gray-900">Today ({usage.dailyDate})</h4>
          </div>
          <div className="space-y-3">
            {/* Daily Searches */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Searches</span>
                <span className={`text-sm font-semibold ${getTextColor(dailySearchPct)}`}>
                  {usage.dailySearches} / {limits.maxDailySearches} ({dailySearchPct}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(dailySearchPct)}`}
                  style={{ width: `${dailySearchPct}%` }}
                />
              </div>
            </div>

            {/* Daily Results */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Results</span>
                <span className={`text-sm font-semibold ${getTextColor(dailyResultsPct)}`}>
                  {usage.dailyResults} / {limits.maxDailyResults} ({dailyResultsPct}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(dailyResultsPct)}`}
                  style={{ width: `${dailyResultsPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Usage */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-bold text-gray-900">This Month ({usage.monthlyPeriod})</h4>
          </div>
          <div className="space-y-3">
            {/* Monthly Searches */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Searches</span>
                <span className={`text-sm font-semibold ${getTextColor(monthlySearchPct)}`}>
                  {usage.monthlySearches} / {limits.maxMonthlySearches} ({monthlySearchPct}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(monthlySearchPct)}`}
                  style={{ width: `${monthlySearchPct}%` }}
                />
              </div>
            </div>

            {/* Monthly Results */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Results</span>
                <span className={`text-sm font-semibold ${getTextColor(monthlyResultsPct)}`}>
                  {usage.monthlyResults} / {limits.maxMonthlyResults} ({monthlyResultsPct}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressColor(monthlyResultsPct)}`}
                  style={{ width: `${monthlyResultsPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-bold text-gray-900">Estimated Cost</h4>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">This month</span>
            <span className="text-lg font-bold text-gray-900">
              {monthlyCost === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `$${monthlyCost.toFixed(2)}`
              )}
            </span>
          </div>
          {usage.monthlySearches < 2500 && (
            <p className="text-xs text-gray-500 mt-1">
              {2500 - usage.monthlySearches} searches remaining in free tier
            </p>
          )}
        </div>

        {/* All-Time Stats */}
        <div className="border-t-2 border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2">All-Time Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Searches</p>
              <p className="text-lg font-bold text-gray-900">{usage.totalSearches.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Results</p>
              <p className="text-lg font-bold text-gray-900">{usage.totalResults.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
