'use client'

import { useState } from 'react'
import { Coins, RefreshCw } from 'lucide-react'

interface SerperBalance {
  creditsLeft: number
  lastUpdated: string
  error?: string
}

export function CreditsDisplay() {
  const [balance, setBalance] = useState<SerperBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/serper/balance')
      const data = await response.json()

      if (response.ok) {
        setBalance(data)
      } else {
        setError(data.error || 'Failed to fetch balance')
      }
    } catch (err: any) {
      console.error('Error fetching balance:', err)
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  // No auto-fetch - only manual refresh via button click

  // Color based on credits remaining
  const getColor = () => {
    if (!balance) return 'text-gray-500'
    if (balance.creditsLeft >= 2000) return 'text-green-500'
    if (balance.creditsLeft >= 1000) return 'text-yellow-500'
    if (balance.creditsLeft >= 500) return 'text-orange-500'
    return 'text-red-500'
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-2 border-red-600 rounded-lg">
        <Coins className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-400">
          Error: {error}
        </span>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          title="Retry"
        >
          <RefreshCw className={`h-3 w-3 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-2 border-slate-600 rounded-lg">
        <Coins className="h-4 w-4 text-gray-500 animate-pulse" />
        <span className="text-sm font-medium text-white">
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-2 border-slate-600 rounded-lg">
      <Coins className={`h-4 w-4 ${getColor()}`} />
      <span className="text-sm font-medium text-white">
        Credits: <span className={getColor()}>{formatNumber(balance.creditsLeft)}</span>
      </span>
      <button
        onClick={fetchBalance}
        disabled={loading}
        className="p-1 hover:bg-slate-700 rounded transition-colors"
        title="Refresh balance"
      >
        <RefreshCw className={`h-3 w-3 text-slate-400 hover:text-white ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
