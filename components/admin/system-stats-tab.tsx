'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Users, MessageSquare, Database, DollarSign, Activity, Server, Cpu, MemoryStick, HardDrive, Zap, RotateCw, Info } from 'lucide-react'
import { toast } from 'sonner'

interface SystemStats {
  users: {
    total: number
    active: number
    inactive: number
    admins: number
    recentLogins: number
  }
  sessions: {
    total: number
  }
  messages: {
    total: number
  }
  costs: {
    totalCost: number
    inputTokens: number
    outputTokens: number
    cachedTokens: number
  }
  models: {
    usage: Array<{ model: string; count: number; totalCost: number }>
    compoundModels: Array<{ model: string; count: number; totalCost: number }>
    regularModels: Array<{ model: string; count: number; totalCost: number }>
  }
  timestamp: string
}

interface HealthMetrics {
  status: string
  timestamp: string
  uptime: {
    seconds: number
    formatted: string
  }
  database: {
    status: string
    latency: number
  }
  memory: {
    heapUsedMB: number
    heapTotalMB: number
    rssMB: number
    heapPercentage: number
  }
  cpu: {
    percent: number
  }
  system: {
    platform: string
    nodeVersion: string
    architecture: string
  }
  responseTime: number
}

export function SystemStatsTab() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(10) // seconds
  const [refreshingModels, setRefreshingModels] = useState(false)

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await fetch('/api/admin/stats')

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
      if (!silent) toast.success('Statistics refreshed')
    } catch (error) {
      console.error('Error fetching stats:', error)
      if (!silent) toast.error('Failed to load statistics')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchHealth = async (silent = false) => {
    try {
      const response = await fetch('/api/admin/health')

      if (!response.ok) {
        throw new Error('Failed to fetch health metrics')
      }

      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error('Error fetching health metrics:', error)
      if (!silent) toast.error('Failed to load health metrics')
    }
  }

  const handleRefreshModels = async () => {
    try {
      setRefreshingModels(true)
      const response = await fetch('/api/models/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh models')
      }

      const data = await response.json()
      toast.success(`Refreshed ${data.count} models from Groq API`)
    } catch (error) {
      console.error('Error refreshing models:', error)
      toast.error('Failed to refresh models')
    } finally {
      setRefreshingModels(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchStats()
    fetchHealth()
  }, [])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchStats(true) // Silent refresh
      fetchHealth(true) // Silent refresh
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-600 py-12">
        Failed to load statistics
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-gray-900">
          System Overview
          {autoRefresh && (
            <span className="ml-2 text-xs text-green-600">
              (Auto-refreshing every {refreshInterval}s)
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {/* Auto-Refresh Toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 accent-black border-2 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
            />
            Auto-refresh
          </label>

          {/* Interval Selector */}
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border-2 border-black rounded-lg px-2 py-1 bg-white text-gray-900"
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          )}

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchStats()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Health Indicators */}
      {health && (
        <div className="bg-white rounded-lg border-2 border-black p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-500" />
            System Health
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Status */}
            <div className="bg-white rounded-lg p-4 border-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-blue-500" />
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-2 ${
                    health.database.status === 'healthy'
                      ? 'bg-green-50 text-green-700 border-green-500'
                      : 'bg-red-50 text-red-700 border-red-500'
                  }`}
                >
                  {health.database.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-lg font-bold text-gray-900">
                {health.database.latency}ms
              </p>
              <p className="text-xs text-gray-500">Query latency</p>
            </div>

            {/* Memory Usage */}
            <div className="bg-white rounded-lg p-4 border-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <MemoryStick className="w-5 h-5 text-purple-500" />
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-2 ${
                    health.memory.heapPercentage < 70
                      ? 'bg-green-50 text-green-700 border-green-500'
                      : health.memory.heapPercentage < 85
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-500'
                      : 'bg-red-50 text-red-700 border-red-500'
                  }`}
                >
                  {health.memory.heapPercentage}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Memory</p>
              <p className="text-lg font-bold text-gray-900">
                {health.memory.heapUsedMB} MB
              </p>
              <p className="text-xs text-gray-500">
                of {health.memory.heapTotalMB} MB heap
              </p>
            </div>

            {/* CPU Usage */}
            <div className="bg-white rounded-lg p-4 border-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <Cpu className="w-5 h-5 text-orange-500" />
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-2 ${
                    health.cpu.percent < 50
                      ? 'bg-green-50 text-green-700 border-green-500'
                      : health.cpu.percent < 75
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-500'
                      : 'bg-red-50 text-red-700 border-red-500'
                  }`}
                >
                  {health.cpu.percent}%
                </span>
              </div>
              <p className="text-sm text-gray-600">CPU</p>
              <p className="text-lg font-bold text-gray-900">
                {health.system.platform}
              </p>
              <p className="text-xs text-gray-500">{health.system.nodeVersion}</p>
            </div>

            {/* Uptime */}
            <div className="bg-white rounded-lg p-4 border-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-xs font-semibold px-2 py-1 rounded-full border-2 bg-green-50 text-green-700 border-green-500">
                  Online
                </span>
              </div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-gray-900">
                {health.uptime.formatted}
              </p>
              <p className="text-xs text-gray-500">
                {health.uptime.seconds.toLocaleString()} seconds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Quick Actions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleRefreshModels}
            disabled={refreshingModels}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-4 h-4 ${refreshingModels ? 'animate-spin' : ''}`} />
            {refreshingModels ? 'Refreshing...' : 'Refresh Models'}
          </button>

          <button
            onClick={() => {
              fetchStats()
              fetchHealth()
              toast.info('Refreshing all data...')
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All Data
          </button>

          <button
            onClick={() => toast.info('Export feature coming soon')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 border-2 border-black transition-colors"
          >
            <HardDrive className="w-4 h-4" />
            Export Logs
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-500" />}
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.active} active, ${stats.users.inactive} inactive`}
        />
        <StatCard
          icon={<Activity className="w-6 h-6 text-green-500" />}
          title="Recent Logins"
          value={stats.users.recentLogins}
          subtitle="Last 7 days"
        />
        <StatCard
          icon={<MessageSquare className="w-6 h-6 text-purple-500" />}
          title="Total Messages"
          value={stats.messages.total.toLocaleString()}
          subtitle={`${stats.sessions.total} sessions`}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-amber-500" />}
          title="Total Cost"
          value={`$${stats.costs.totalCost.toFixed(4)}`}
          subtitle={`${(stats.costs.inputTokens + stats.costs.outputTokens).toLocaleString()} tokens`}
        />
      </div>

      {/* Token Breakdown */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Token Usage
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Input Tokens</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.costs.inputTokens.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Output Tokens</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.costs.outputTokens.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cached Tokens</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.costs.cachedTokens.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Compound Model Pricing Info */}
      {stats.models.compoundModels.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Compound Model Pricing
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Compound models (groq/compound, groq/compound-mini) use <strong>pass-through pricing</strong>,
                meaning costs vary based on which underlying models and built-in tools are used for each request.
              </p>
              <div className="bg-white border-2 border-blue-300 rounded-lg p-3 space-y-2 text-xs text-gray-600">
                <p><strong>Pricing Components:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Underlying model costs (e.g., Llama 3.1, Llama 4): $0.05-$0.60 per 1M tokens</li>
                  <li>Web Search: $5-8 per 1,000 searches</li>
                  <li>Code Execution: $0.18 per hour</li>
                  <li>Browser Automation: Variable pricing</li>
                  <li>Wolfram Alpha: Variable pricing</li>
                </ul>
                <p className="mt-2 text-blue-700 font-medium">
                  📊 Actual costs depend on request complexity and tool usage
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Usage - Compound Models */}
      {stats.models.compoundModels.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-black p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Compound Models (Pass-Through Pricing)
          </h4>
          <div className="space-y-3">
            {stats.models.compoundModels.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-600">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-gray-900 font-mono font-semibold block">
                      {model.model}
                    </span>
                    <span className="text-xs text-purple-700">
                      Variable pricing (tools + underlying models)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {model.count} sessions
                  </div>
                  <div className="text-xs text-gray-600">
                    ${model.totalCost.toFixed(4)} tracked
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Usage - Regular Models */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          {stats.models.regularModels.length > 0 ? 'Regular Models (Fixed Pricing)' : 'Top Models (by session count)'}
        </h4>
        <div className="space-y-3">
          {stats.models.regularModels.length > 0 ? (
            stats.models.regularModels.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between border-2 border-black rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-600">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-900 font-mono">
                    {model.model}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {model.count} sessions
                  </div>
                  <div className="text-xs text-gray-600">
                    ${model.totalCost.toFixed(4)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 text-center py-4">
              No regular model usage data yet
            </p>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 text-center">
        Last updated: {new Date(stats.timestamp).toLocaleString()}
      </p>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
}

function StatCard({ icon, title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-black">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <h4 className="text-sm font-medium text-gray-600 mb-1">
        {title}
      </h4>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  )
}
