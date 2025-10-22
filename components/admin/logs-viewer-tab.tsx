'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  Server,
  Database,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LogsData {
  system: {
    platform: string
    arch: string
    nodeVersion: string
    cpuCores: number
    totalMemoryGB: string
    usedMemoryGB: string
    freeMemoryGB: string
    memoryUsagePercent: string
    systemUptime: number
    processUptime: number
    processUptimeFormatted: string
    loadAverage: string[]
  }
  performance: {
    apiResponseTime: number
    dbQueryTime: number
    avgApiResponseTime: number
    slowestEndpoint: string
    slowestEndpointTime: number
  }
  database: {
    status: string
    type: string
    userCount: number
    recentOperations: {
      type: string
      id: string
      details: string
      timestamp: string
    }[]
  }
  logs: {
    id: number
    timestamp: string
    level: string
    message: string
    details: any
  }[]
  healthChecks: {
    api: { status: string; responseTime: number }
    database: { status: string; responseTime: number }
    memory: { status: string; usagePercent: string }
    disk: { status: string; usagePercent: string }
  }
  timestamp: string
}

export function LogsViewerTab() {
  const [data, setData] = useState<LogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/logs')
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error loading logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-600 font-medium">
          {error || 'Failed to load logs'}
        </p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warn':
        return 'bg-orange-100 text-orange-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">Logs & Monitoring</h3>
        <p className="text-sm text-gray-600">
          System health, performance metrics, and application logs
        </p>
      </div>

      {/* Health Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Status</p>
              <p className="text-lg font-bold text-gray-900">
                {data.healthChecks.api.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.healthChecks.api.responseTime}ms
              </p>
            </div>
            {getStatusIcon(data.healthChecks.api.status)}
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-lg font-bold text-gray-900">
                {data.healthChecks.database.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.healthChecks.database.responseTime}ms
              </p>
            </div>
            {getStatusIcon(data.healthChecks.database.status)}
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Memory</p>
              <p className="text-lg font-bold text-gray-900">
                {data.healthChecks.memory.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.healthChecks.memory.usagePercent}% used
              </p>
            </div>
            {getStatusIcon(data.healthChecks.memory.status)}
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disk</p>
              <p className="text-lg font-bold text-gray-900">
                {data.healthChecks.disk.status}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.healthChecks.disk.usagePercent}
              </p>
            </div>
            {getStatusIcon(data.healthChecks.disk.status)}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Platform</p>
            <p className="text-sm font-medium text-gray-900">
              {data.system.platform} ({data.system.arch})
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Node.js Version</p>
            <p className="text-sm font-medium text-gray-900">
              {data.system.nodeVersion}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">CPU Cores</p>
            <p className="text-sm font-medium text-gray-900">
              {data.system.cpuCores} cores
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Memory Usage</p>
            <p className="text-sm font-medium text-gray-900">
              {data.system.usedMemoryGB} GB / {data.system.totalMemoryGB} GB ({data.system.memoryUsagePercent}%)
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Process Uptime</p>
            <p className="text-sm font-medium text-gray-900">
              {data.system.processUptimeFormatted}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Load Average</p>
            <p className="text-sm font-medium text-gray-900">
              {data.system.loadAverage.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-600">API Response Time</p>
            <p className="text-sm font-medium text-gray-900">
              {data.performance.apiResponseTime}ms (current)
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Avg API Response Time</p>
            <p className="text-sm font-medium text-gray-900">
              {data.performance.avgApiResponseTime}ms
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">DB Query Time</p>
            <p className="text-sm font-medium text-gray-900">
              {data.performance.dbQueryTime}ms
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Slowest Endpoint</p>
            <p className="text-sm font-medium text-gray-900">
              {data.performance.slowestEndpoint}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Slowest Response Time</p>
            <p className="text-sm font-medium text-gray-900">
              {data.performance.slowestEndpointTime}ms
            </p>
          </div>
        </div>
      </div>

      {/* Application Logs */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Application Logs
        </h4>
        <div className="space-y-2">
          {data.logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="mt-0.5">{getLevelIcon(log.level)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-900">{log.message}</p>
                {log.details && (
                  <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Operations */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Recent Database Operations
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Details
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {data.database.recentOperations.map((op, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm font-medium text-gray-900">
                    {op.type}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {op.details}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {formatDistanceToNow(new Date(op.timestamp), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()} • Auto-refreshes every 10 seconds
      </p>
    </div>
  )
}
