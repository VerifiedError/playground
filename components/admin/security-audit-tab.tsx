'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  Shield,
  Users,
  Lock,
  UserX,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SecurityData {
  summary: {
    totalUsers: number
    activeUsers: number
    lockedUsers: number
    adminCount: number
    inactiveUsersCount: number
  }
  recentLogins: {
    id: number
    username: string
    email: string
    role: string
    lastLoginAt: string | null
    isActive: boolean
  }[]
  inactiveUsers: {
    id: number
    username: string
    email: string
    createdAt: string
    lastLoginAt: string | null
    daysSinceLogin: number | null
  }[]
  recentActivity: {
    id: string
    title: string
    model: string
    username: string
    createdAt: string
  }[]
  sessionsPerDay: {
    date: string
    count: number
  }[]
  securitySettings: {
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    rateLimiting: {
      enabled: boolean
      maxAttempts: number
      windowMinutes: number
      blockDurationMinutes: number
    }
    sessionSecurity: {
      sessionTimeoutDays: number
      maxConcurrentSessions: number | null
    }
    accountSecurity: {
      requireEmailVerification: boolean
      mfaEnabled: boolean
      autoLockAfterDays: number | null
    }
  }
  timestamp: string
}

export function SecurityAuditTab() {
  const [data, setData] = useState<SecurityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/security')
      if (!response.ok) {
        throw new Error('Failed to fetch security data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error loading security data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
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
          {error || 'Failed to load security data'}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">Security & Audit</h3>
        <p className="text-sm text-gray-600">
          Security monitoring, user activity, and system settings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.summary.activeUsers} active
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locked Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.lockedUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive accounts
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.adminCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Admin accounts
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.inactiveUsersCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                No login 30+ days
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Policy */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Password Policy
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Minimum Length</span>
                <span className="font-medium">{data.securitySettings.passwordPolicy.minLength} characters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Require Uppercase</span>
                {data.securitySettings.passwordPolicy.requireUppercase ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Require Numbers</span>
                {data.securitySettings.passwordPolicy.requireNumbers ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Require Special Chars</span>
                {data.securitySettings.passwordPolicy.requireSpecialChars ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Rate Limiting
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Enabled</span>
                {data.securitySettings.rateLimiting.enabled ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-red-600">Disabled</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Max Attempts</span>
                <span className="font-medium">{data.securitySettings.rateLimiting.maxAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Window</span>
                <span className="font-medium">{data.securitySettings.rateLimiting.windowMinutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Block Duration</span>
                <span className="font-medium">{data.securitySettings.rateLimiting.blockDurationMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Session Security */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Session Security
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Session Timeout</span>
                <span className="font-medium">{data.securitySettings.sessionSecurity.sessionTimeoutDays} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Max Concurrent Sessions</span>
                <span className="font-medium">
                  {data.securitySettings.sessionSecurity.maxConcurrentSessions || 'Unlimited'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-2">
              Account Security
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Verification</span>
                {data.securitySettings.accountSecurity.requireEmailVerification ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">MFA Enabled</span>
                {data.securitySettings.accountSecurity.mfaEnabled ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Auto-Lock After</span>
                <span className="font-medium">
                  {data.securitySettings.accountSecurity.autoLockAfterDays ? `${data.securitySettings.accountSecurity.autoLockAfterDays} days` : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logins Table */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Logins (Last 20)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Username
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Role
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Last Login
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentLogins.map((user) => (
                <tr key={user.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900">
                    {user.lastLoginAt
                      ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                      : 'Never'}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <Lock className="w-4 h-4" />
                        Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inactive Users Table */}
      {data.inactiveUsers.length > 0 && (
        <div className="bg-white border-2 border-orange-500 rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Inactive Users (No Login 30+ Days)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-orange-500">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                    Username
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                    Last Login
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-900">
                    Days Inactive
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.inactiveUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-2 px-3 text-sm text-orange-600 text-right font-medium">
                      {user.daysSinceLogin || 'Never logged in'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity (Last 24h) */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity (Last 24 Hours)
        </h4>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500">No activity in the last 24 hours</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.username}</span> created session
                    {' "'}
                    <span className="font-medium">{activity.title}</span>
                    {'"'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.model.split('/')[1]} • {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()} • Auto-refreshes every 30 seconds
      </p>
    </div>
  )
}
