'use client'

/**
 * Credit Usage Badge (Non-Intrusive)
 *
 * Only shows when usage > 70% as a small floating badge.
 * Replaces always-visible credit usage bar.
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { getCreditUsage, getCreditLimits } from '@/lib/credit-manager'
import type { CreditUsage, CreditLimits } from '@/lib/credit-manager'

interface CreditBadgeProps {
  onSettingsClick?: () => void
}

export function CreditBadge({ onSettingsClick }: CreditBadgeProps) {
  const [usage, setUsage] = useState<CreditUsage | null>(null)
  const [limits, setLimits] = useState<CreditLimits | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setUsage(getCreditUsage())
    setLimits(getCreditLimits())
  }, [])

  if (!usage || !limits || dismissed) return null

  // Calculate highest usage percentage
  const dailySearchPct = (usage.dailySearches / limits.maxDailySearches) * 100
  const dailyResultsPct = (usage.dailyResults / limits.maxDailyResults) * 100
  const monthlySearchPct = (usage.monthlySearches / limits.maxMonthlySearches) * 100
  const monthlyResultsPct = (usage.monthlyResults / limits.maxMonthlyResults) * 100

  const maxPct = Math.max(dailySearchPct, dailyResultsPct, monthlySearchPct, monthlyResultsPct)

  // Only show if usage > 70%
  if (maxPct < 70) return null

  // Determine color based on percentage
  const isWarning = maxPct >= 70 && maxPct < 90
  const isDanger = maxPct >= 90

  const bgColor = isDanger ? 'bg-red-600' : 'bg-yellow-600'
  const textColor = 'text-white'
  const borderColor = isDanger ? 'border-red-700' : 'border-yellow-700'

  // Determine which limit is highest
  let limitType = ''
  if (maxPct === dailySearchPct) limitType = 'Daily searches'
  else if (maxPct === dailyResultsPct) limitType = 'Daily results'
  else if (maxPct === monthlySearchPct) limitType = 'Monthly searches'
  else limitType = 'Monthly results'

  return (
    <div className="fixed top-20 right-4 md:right-6 z-30 animate-slide-in-right">
      <div className={`${bgColor} ${textColor} border-2 ${borderColor} rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg max-w-sm`}>
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">
            {Math.round(maxPct)}% of {limitType.toLowerCase()} used
          </p>
          <button
            onClick={onSettingsClick}
            className="text-xs underline hover:no-underline mt-0.5"
          >
            View details
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
