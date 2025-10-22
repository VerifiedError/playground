'use client'

import { useState, useEffect } from 'react'
import { DollarSign, AlertTriangle, Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface CostLimits {
  dailyLimit: number
  weeklyLimit: number
  monthlyLimit: number
  sessionLimit: number
  emailAlerts: boolean
}

export function CostLimitsSettings() {
  const [limits, setLimits] = useState<CostLimits>({
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
    sessionLimit: 0,
    emailAlerts: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/analytics/limits')
      if (response.ok) {
        const data = await response.json()
        setLimits({
          dailyLimit: data.dailyLimit,
          weeklyLimit: data.weeklyLimit,
          monthlyLimit: data.monthlyLimit,
          sessionLimit: data.sessionLimit,
          emailAlerts: data.emailAlerts,
        })
      }
    } catch (error) {
      console.error('Failed to fetch limits:', error)
      toast.error('Failed to load cost limits')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/analytics/limits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limits),
      })

      if (response.ok) {
        toast.success('Cost limits saved successfully')
      } else {
        toast.error('Failed to save cost limits')
      }
    } catch (error) {
      console.error('Failed to save limits:', error)
      toast.error('Failed to save cost limits')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLimits({
      dailyLimit: 0,
      weeklyLimit: 0,
      monthlyLimit: 0,
      sessionLimit: 0,
      emailAlerts: true,
    })
    toast.info('Limits reset to defaults (not saved)')
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading cost limits...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Cost Limits</h3>
          <p className="text-sm text-muted-foreground">
            Set budget limits to prevent unexpected costs. Set to 0 to disable.
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <p className="font-medium mb-1">How limits work:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Warning at 80% of any limit (toast notification)</li>
            <li>Block at 100% of any limit (chat disabled)</li>
            <li>Limits reset automatically (daily at midnight, weekly/monthly on start date)</li>
          </ul>
        </div>
      </div>

      {/* Limit Inputs */}
      <div className="space-y-4">
        {/* Daily Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Daily Limit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limits.dailyLimit}
            onChange={(e) => setLimits({ ...limits, dailyLimit: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00 (disabled)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum cost per day. Resets at midnight.
          </p>
        </div>

        {/* Weekly Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Weekly Limit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limits.weeklyLimit}
            onChange={(e) => setLimits({ ...limits, weeklyLimit: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00 (disabled)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum cost per week (last 7 days rolling).
          </p>
        </div>

        {/* Monthly Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Monthly Limit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limits.monthlyLimit}
            onChange={(e) => setLimits({ ...limits, monthlyLimit: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00 (disabled)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum cost per month (calendar month).
          </p>
        </div>

        {/* Per-Session Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Per-Session Limit ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limits.sessionLimit}
            onChange={(e) => setLimits({ ...limits, sessionLimit: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00 (disabled)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum cost per individual chat session.
          </p>
        </div>

        {/* Email Alerts Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Email Alerts</p>
            <p className="text-sm text-muted-foreground">
              Receive email notifications when approaching limits
            </p>
          </div>
          <button
            onClick={() => setLimits({ ...limits, emailAlerts: !limits.emailAlerts })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              limits.emailAlerts ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                limits.emailAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Limits'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  )
}
