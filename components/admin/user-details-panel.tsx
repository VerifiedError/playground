'use client'

/**
 * COMPREHENSIVE USER DETAILS PANEL
 * CIA-Level Per-User Tracking
 *
 * Features:
 * - Complete activity timeline
 * - Login history with IP/browser/location tracking
 * - Session statistics and cost breakdown
 * - Usage patterns (models, peak hours, features)
 * - Risk scoring and security indicators
 * - Export user data
 */

import { useState, useEffect } from 'react'
import {
  Loader2,
  Clock,
  Globe,
  Monitor,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  DollarSign,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Activity as ActivityIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Target,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface UserDetailsProps {
  userId: number
  username: string
}

interface AuditLogEntry {
  id: string
  action: string
  category: string
  severity: string
  description: string
  ipAddress: string | null
  userAgent: string | null
  timestamp: string
}

interface LoginHistory {
  id: string
  ipAddress: string
  userAgent: string | null
  country: string | null
  browser: string | null
  device: string | null
  success: boolean
  timestamp: string
}

interface SessionStats {
  totalSessions: number
  totalMessages: number
  totalCost: number
  avgMessagesPerSession: number
  avgCostPerSession: number
  avgSessionDuration: number // minutes
  lastSessionAt: string | null
}

interface ModelUsage {
  model: string
  sessions: number
  messages: number
  cost: number
  percentage: number
}

interface UsagePattern {
  peakHour: number
  peakDay: number
  totalHoursActive: number
  daysActive: number
  avgDailyMessages: number
}

interface RiskIndicators {
  score: number // 0-100 (0 = safe, 100 = high risk)
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  factors: Array<{
    factor: string
    severity: 'info' | 'warning' | 'danger'
    description: string
  }>
  failedLoginAttempts: number
  suspiciousActivity: number
}

interface UserDetailsData {
  activityTimeline: AuditLogEntry[]
  loginHistory: LoginHistory[]
  sessionStats: SessionStats
  modelUsage: ModelUsage[]
  usagePatterns: UsagePattern
  riskIndicators: RiskIndicators
  costByDay: Array<{ date: string; cost: number }>
  messagesByHour: Array<{ hour: number; count: number }>
}

const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB']

export function UserDetailsPanel({ userId, username }: UserDetailsProps) {
  const [data, setData] = useState<UserDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'logins' | 'security'>('overview')

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${userId}/details`)
      if (!response.ok) throw new Error('Failed to load user details')

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error loading user details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user details')
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const exportUserData = () => {
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-${username}-${new Date().toISOString()}.json`
    a.click()
    toast.success('User data exported')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-black">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-black gap-4">
        <p className="text-red-600 font-medium">{error || 'Failed to load user details'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'text-green-600 bg-green-50 border-green-500'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-500'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-500'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-500'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-500'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-500'
    }
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'safe':
        return <CheckCircle className="w-5 h-5" />
      case 'low':
      case 'medium':
        return <Shield className="w-5 h-5" />
      case 'high':
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  return (
    <div className="bg-white border-2 border-black rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h3 className="text-xl font-bold text-gray-900">User Details: {username}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive activity and security tracking
          </p>
        </div>
        <button
          onClick={exportUserData}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-2 border-black overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Overview
          </div>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-3 text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Activity
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-3 text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'logins'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Logins
          </div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Session Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-gray-700" />
                <p className="text-sm font-semibold text-gray-700">Total Sessions</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.sessionStats.totalSessions}</p>
              <p className="text-xs text-gray-600 mt-1">
                {data.sessionStats.totalMessages} messages total
              </p>
              <p className="text-xs text-gray-600">
                Avg: {data.sessionStats.avgMessagesPerSession.toFixed(1)} msgs/session
              </p>
            </div>

            <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <p className="text-sm font-semibold text-gray-700">Total Cost</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ${data.sessionStats.totalCost.toFixed(4)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Avg: ${data.sessionStats.avgCostPerSession.toFixed(4)}/session
              </p>
            </div>

            <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-700" />
                <p className="text-sm font-semibold text-gray-700">Avg Duration</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.sessionStats.avgSessionDuration.toFixed(0)}m
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Last: {data.sessionStats.lastSessionAt
                  ? formatDistanceToNow(new Date(data.sessionStats.lastSessionAt), { addSuffix: true })
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Model Usage & Cost by Day */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Model Usage (Pie Chart) */}
            <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
              <h4 className="text-base font-bold text-gray-900 mb-4">Model Usage</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.modelUsage}
                    dataKey="sessions"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.model.split('/')[1]}: ${entry.sessions}`}
                  >
                    {data.modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #000',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Over Time (Area Chart) */}
            <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
              <h4 className="text-base font-bold text-gray-900 mb-4">Cost by Day</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.costByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #000',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `$${value.toFixed(4)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#000"
                    strokeWidth={2}
                    name="Cost"
                    dot={{ fill: '#000', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Usage Patterns */}
          <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
            <h4 className="text-base font-bold text-gray-900 mb-4">Usage Patterns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Peak Activity Hour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.usagePatterns.peakHour}:00 - {data.usagePatterns.peakHour + 1}:00
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Peak Activity Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][data.usagePatterns.peakDay]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Active Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.usagePatterns.totalHoursActive}h
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Avg Daily Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.usagePatterns.avgDailyMessages.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Hourly Activity Chart */}
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.messagesByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #000',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4B5563" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h4 className="text-base font-bold text-gray-900">Activity Timeline</h4>
          {data.activityTimeline.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No activity recorded</p>
          ) : (
            <div className="space-y-2">
              {data.activityTimeline.map((log) => (
                <div key={log.id} className="bg-gray-50 border-2 border-black rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          log.severity === 'error' ? 'bg-red-100 text-red-700' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.category}
                        </span>
                        <span className="text-xs text-gray-600 font-mono">{log.action}</span>
                      </div>
                      <p className="text-sm text-gray-900">{log.description}</p>
                      {log.ipAddress && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {log.ipAddress}
                          </span>
                          {log.userAgent && (
                            <span className="flex items-center gap-1 truncate">
                              <Monitor className="w-3 h-3" />
                              {log.userAgent.substring(0, 50)}...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logins' && (
        <div className="space-y-4">
          <h4 className="text-base font-bold text-gray-900">Login History</h4>
          {data.loginHistory.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No login history</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">IP Address</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Location</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Device</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.loginHistory.map((login) => (
                    <tr key={login.id} className="border-b border-gray-200">
                      <td className="py-2 px-3">
                        {login.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-900 font-mono">
                        {login.ipAddress}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-900">
                        {login.country || 'Unknown'}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {login.browser && login.device
                          ? `${login.browser} on ${login.device}`
                          : 'Unknown'}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {formatDistanceToNow(new Date(login.timestamp), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Risk Score */}
          <div className={`border-2 rounded-lg p-6 ${getRiskLevelColor(data.riskIndicators.level)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getRiskLevelIcon(data.riskIndicators.level)}
                <div>
                  <h4 className="text-lg font-bold capitalize">{data.riskIndicators.level} Risk</h4>
                  <p className="text-sm">Security Risk Score: {data.riskIndicators.score}/100</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">Failed Logins: {data.riskIndicators.failedLoginAttempts}</p>
                <p className="text-sm">Suspicious Activity: {data.riskIndicators.suspiciousActivity}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white rounded-full h-4 border-2 border-current">
              <div
                className="h-full rounded-full bg-current transition-all"
                style={{ width: `${data.riskIndicators.score}%` }}
              />
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-4">Risk Factors</h4>
            {data.riskIndicators.factors.length === 0 ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-semibold">No security concerns detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.riskIndicators.factors.map((factor, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${
                      factor.severity === 'danger'
                        ? 'bg-red-50 border-red-500'
                        : factor.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {factor.severity === 'danger' ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : factor.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{factor.factor}</p>
                        <p className="text-sm text-gray-700 mt-1">{factor.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
