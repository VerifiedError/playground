'use client'

/**
 * COMPREHENSIVE LOGS VIEWER TAB
 * CIA-Level Tracking with Real Audit Data
 *
 * Features:
 * - Real audit logs from database
 * - Security events tracking
 * - API usage logs
 * - Advanced filtering (level, category, user, IP, timeRange)
 * - Full-text search
 * - Export to JSON/CSV
 * - Pagination with infinite scroll
 * - Real-time updates (every 10s)
 * - Detailed log expansion with metadata
 * - Performance metrics dashboard
 * - System health monitoring
 */

import { useState, useEffect } from 'react'
import {
  Loader2,
  Server,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  Clock,
  User as UserIcon,
  Globe,
  Terminal,
  Shield,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface AuditLog {
  id: string
  userId: number | null
  user: { username: string } | null
  action: string
  category: string
  severity: string
  description: string
  metadata: any
  resourceType: string | null
  resourceId: string | null
  ipAddress: string | null
  userAgent: string | null
  requestMethod: string | null
  requestPath: string | null
  statusCode: number | null
  responseTime: number | null
  changesBefore: any
  changesAfter: any
  timestamp: string
}

interface SecurityEvent {
  id: string
  userId: number | null
  user: { username: string } | null
  eventType: string
  severity: string
  description: string
  details: any
  ipAddress: string
  userAgent: string | null
  country: string | null
  isVpn: boolean | null
  isTor: boolean | null
  attemptCount: number
  targetResource: string | null
  attackVector: string | null
  actionTaken: string | null
  isResolved: boolean
  firstSeen: string
  lastSeen: string
}

interface LogsData {
  auditLogs: AuditLog[]
  securityEvents: SecurityEvent[]
  summary: {
    totalAuditLogs: number
    totalSecurityEvents: number
    criticalEvents: number
    failedLogins: number
    successfulLogins: number
    apiCalls: number
    avgResponseTime: number
  }
  performance: {
    apiResponseTime: number
    dbQueryTime: number
    slowestEndpoint: string
    slowestEndpointTime: number
  }
  system: {
    platform: string
    nodeVersion: string
    memoryUsagePercent: string
    cpuPercent: number
    uptime: string
  }
  timestamp: string
}

export function EnhancedLogsViewer() {
  const [data, setData] = useState<LogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [ipFilter, setIpFilter] = useState<string>('')
  const [timeRange, setTimeRange] = useState<string>('24h')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [logType, setLogType] = useState<'audit' | 'security'>('audit')

  // UI State
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        timeRange,
        page: page.toString(),
        limit: '50',
      })

      if (categoryFilter) params.append('category', categoryFilter)
      if (severityFilter) params.append('severity', severityFilter)
      if (actionFilter) params.append('action', actionFilter)
      if (userFilter) params.append('userId', userFilter)
      if (ipFilter) params.append('ipAddress', ipFilter)
      if (searchQuery) params.append('search', searchQuery)

      const endpoint = logType === 'audit'
        ? `/api/admin/audit/logs?${params}`
        : `/api/admin/security/events?${params}`

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to fetch logs')

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error loading logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load logs')
      if (!silent) toast.error('Failed to load logs')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [logType, categoryFilter, severityFilter, actionFilter, userFilter, ipFilter, timeRange, page, searchQuery])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => loadData(true), 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [autoRefresh, logType, categoryFilter, severityFilter, timeRange])

  const handleExport = (format: 'json' | 'csv') => {
    if (!data) return

    const logs = logType === 'audit' ? data.auditLogs : data.securityEvents

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${logType}-logs-${new Date().toISOString()}.json`
      a.click()
      toast.success('Logs exported as JSON')
    } else {
      // CSV export
      const headers = Object.keys(logs[0] || {}).join(',')
      const rows = logs.map(log => Object.values(log).map(v => JSON.stringify(v)).join(','))
      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${logType}-logs-${new Date().toISOString()}.csv`
      a.click()
      toast.success('Logs exported as CSV')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'error':
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'info':
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-500'
      case 'error':
      case 'high':
        return 'bg-red-50 text-red-700 border-red-400'
      case 'warning':
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-400'
      case 'info':
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-400'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-400'
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-600 font-medium">{error || 'Failed to load logs'}</p>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const logs = logType === 'audit' ? data.auditLogs : data.securityEvents

  return (
    <div className="space-y-6">
      {/* Header with Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Terminal className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Total Logs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.summary.totalAuditLogs.toLocaleString()}</p>
        </div>

        <div className="bg-white border-2 border-red-500 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-xs text-red-600">Security Events</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{data.summary.totalSecurityEvents}</p>
          <p className="text-xs text-red-500 mt-1">{data.summary.criticalEvents} critical</p>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-600">Logins</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.summary.successfulLogins}</p>
          <p className="text-xs text-red-600 mt-1">{data.summary.failedLogins} failed</p>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Server className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-gray-600">Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.summary.avgResponseTime}ms</p>
          <p className="text-xs text-gray-600 mt-1">{data.summary.apiCalls} API calls</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-2 border-black rounded-lg p-4 space-y-4">
        {/* Log Type Toggle */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogType('audit')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                logType === 'audit'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-black hover:bg-gray-100'
              }`}
            >
              <Terminal className="w-4 h-4 inline mr-2" />
              Audit Logs
            </button>
            <button
              onClick={() => setLogType('security')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                logType === 'security'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-black hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security Events
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-refresh (10s)
            </label>

            <button
              onClick={() => loadData()}
              disabled={loading}
              className="px-3 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
              title="Export as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs (description, IP, user, action)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          {logType === 'audit' && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900"
              >
                <option value="">All Categories</option>
                <option value="auth">Auth</option>
                <option value="session">Session</option>
                <option value="admin">Admin</option>
                <option value="api">API</option>
                <option value="search">Search</option>
                <option value="system">System</option>
                <option value="user">User</option>
              </select>

              <select
                value="actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900"
              >
                <option value="">All Actions</option>
                <option value="user.login">Login</option>
                <option value="user.login.failed">Login Failed</option>
                <option value="user.register">Register</option>
                <option value="user.logout">Logout</option>
                <option value="session.create">Session Create</option>
                <option value="api.chat">API Chat</option>
                <option value="admin.">Admin Actions</option>
              </select>
            </>
          )}

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="medium">Medium</option>
            <option value="info">Info</option>
            <option value="low">Low</option>
          </select>

          <input
            type="text"
            placeholder="Filter by IP..."
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            className="px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900"
          />

          <button
            onClick={() => {
              setCategoryFilter('')
              setSeverityFilter('')
              setActionFilter('')
              setUserFilter('')
              setIpFilter('')
              setSearchQuery('')
              toast.info('Filters cleared')
            }}
            className="px-3 py-2 bg-white text-gray-900 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-lg p-12 text-center">
            <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No logs found matching your filters</p>
          </div>
        ) : (
          logs.map((log: any) => {
            const isExpanded = expandedLogId === log.id
            const isAuditLog = logType === 'audit'

            return (
              <div
                key={log.id}
                className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getSeverityIcon(log.severity)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border-2 ${getSeverityColor(log.severity)}`}
                          >
                            {log.severity.toUpperCase()}
                          </span>

                          {isAuditLog ? (
                            <>
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-300">
                                {log.category}
                              </span>
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 border border-blue-300">
                                {log.action}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 border border-purple-300">
                                {log.eventType}
                              </span>
                              {log.attackVector && (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 border border-red-300">
                                  {log.attackVector}
                                </span>
                              )}
                            </>
                          )}

                          {log.user && (
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {log.user.username}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-900 font-medium mb-1">{log.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {log.ipAddress}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(isAuditLog ? log.timestamp : log.lastSeen), { addSuffix: true })}
                          </span>

                          {isAuditLog && log.responseTime && (
                            <span className={log.responseTime > 1000 ? 'text-orange-600' : ''}>
                              {log.responseTime}ms
                            </span>
                          )}

                          {!isAuditLog && log.attemptCount > 1 && (
                            <span className="text-red-600 font-medium">
                              {log.attemptCount} attempts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t-2 border-black bg-gray-50 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {isAuditLog ? (
                        <>
                          {log.requestMethod && (
                            <div>
                              <span className="font-semibold text-gray-700">Request:</span>
                              <p className="text-gray-900 font-mono">{log.requestMethod} {log.requestPath}</p>
                            </div>
                          )}
                          {log.statusCode && (
                            <div>
                              <span className="font-semibold text-gray-700">Status Code:</span>
                              <p className="text-gray-900">{log.statusCode}</p>
                            </div>
                          )}
                          {log.resourceType && (
                            <div>
                              <span className="font-semibold text-gray-700">Resource:</span>
                              <p className="text-gray-900">{log.resourceType} {log.resourceId && `(${log.resourceId})`}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-semibold text-gray-700">Target:</span>
                            <p className="text-gray-900">{log.targetResource || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Action Taken:</span>
                            <p className="text-gray-900">{log.actionTaken || 'None'}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">First Seen:</span>
                            <p className="text-gray-900">{new Date(log.firstSeen).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Last Seen:</span>
                            <p className="text-gray-900">{new Date(log.lastSeen).toLocaleString()}</p>
                          </div>
                          {log.country && (
                            <div>
                              <span className="font-semibold text-gray-700">Country:</span>
                              <p className="text-gray-900">{log.country}</p>
                            </div>
                          )}
                          {log.isVpn !== null && (
                            <div>
                              <span className="font-semibold text-gray-700">VPN:</span>
                              <p className={log.isVpn ? 'text-orange-600' : 'text-gray-900'}>{log.isVpn ? 'Yes' : 'No'}</p>
                            </div>
                          )}
                        </>
                      )}

                      {log.userAgent && (
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700">User Agent:</span>
                          <p className="text-gray-900 text-xs break-all">{log.userAgent}</p>
                        </div>
                      )}
                    </div>

                    {(log.metadata || log.details) && (
                      <div>
                        <span className="font-semibold text-gray-700 text-sm">Metadata:</span>
                        <pre className="mt-2 p-3 bg-white border-2 border-black rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata || log.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.changesBefore && log.changesAfter && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-gray-700 text-sm">Before:</span>
                          <pre className="mt-2 p-3 bg-white border-2 border-black rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.changesBefore, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 text-sm">After:</span>
                          <pre className="mt-2 p-3 bg-white border-2 border-black rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.changesAfter, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Load More */}
      {logs.length >= 50 && (
        <div className="text-center">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Load More Logs
          </button>
        </div>
      )}

      {/* System Health Footer */}
      <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>Platform: {data.system.platform}</span>
            <span>Node: {data.system.nodeVersion}</span>
            <span>Memory: {data.system.memoryUsagePercent}%</span>
            <span>Uptime: {data.system.uptime}</span>
          </div>
          <span>Last updated: {formatDistanceToNow(new Date(data.timestamp), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
