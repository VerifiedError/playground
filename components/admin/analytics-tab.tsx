'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { Loader2, TrendingUp, MessageSquare, DollarSign, Users, Activity } from 'lucide-react'
import { formatCost } from '@/lib/cost-calculator'

interface AnalyticsData {
  summary: {
    totalMessages: number
    totalCost: number
    totalSessions: number
    avgMessagesPerDay: number
    avgCostPerDay: string
    avgSessionsPerDay: number
  }
  charts: {
    messagesOverTime: { date: string; count: number }[]
    sessionsOverTime: { date: string; count: number }[]
    costOverTime: { date: string; cost: number }[]
    activeUsersOverTime: { date: string; active_users: number }[]
    modelUsage: { model: string; count: number; cost: number }[]
    costDistribution: { model: string; cost: number }[]
    hourlyActivity: { hour: number; count: number }[]
    dayOfWeekActivity: { day: number; count: number }[]
  }
  recentSessions: {
    id: string
    title: string
    model: string
    username: string
    messageCount: number
    cost: number
    createdAt: string
  }[]
  topUsers: {
    id: number
    username: string
    messageCount: number
    totalCost: number
  }[]
  timestamp: string
}

const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/analytics?days=${days}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [days])

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
          {error || 'Failed to load analytics'}
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
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Analytics & Insights</h3>
          <p className="text-sm text-gray-600">
            Usage metrics and trends over the last {days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              days === 7
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              days === 30
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDays(90)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              days === 90
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalMessages.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {data.summary.avgMessagesPerDay}/day
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCost(data.summary.totalCost)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatCost(parseFloat(data.summary.avgCostPerDay))}/day
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.totalSessions.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {data.summary.avgSessionsPerDay}/day
              </p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Over Time (Line Chart) */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4">Messages Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.charts.messagesOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #000',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#000"
              strokeWidth={2}
              name="Messages"
              dot={{ fill: '#000', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Over Time (Area Chart) */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4">Cost Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.charts.costOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #000',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCost(value)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#000"
              fill="#4B5563"
              strokeWidth={2}
              name="Cost"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions Created & Active Users (Dual Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sessions Created (Bar Chart) */}
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4">
            Sessions Created
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.sessionsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#000" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Users (Line Chart) */}
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4">
            Active Users Over Time
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.charts.activeUsersOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="active_users"
                stroke="#000"
                strokeWidth={2}
                name="Active Users"
                dot={{ fill: '#000', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Usage & Cost Distribution (Dual Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Usage (Pie Chart) */}
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4">
            Model Usage Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.modelUsage}
                dataKey="count"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.model.split('/')[1]}: ${entry.count}`}
              >
                {data.charts.modelUsage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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

        {/* Cost Distribution (Pie Chart) */}
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4">
            Cost Distribution by Model
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.charts.costDistribution}
                dataKey="cost"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) =>
                  `${entry.model.split('/')[1]}: ${formatCost(entry.cost)}`
                }
              >
                {data.charts.costDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCost(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Activity & Day of Week Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Activity (Bar Chart) */}
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4">
            Activity by Hour of Day
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
                label={{ value: 'Hour (24h)', position: 'insideBottom', offset: -5 }}
              />
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

        {/* Day of Week Activity (Bar Chart) */}
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h4 className="text-base font-bold text-gray-900 mb-4">
            Activity by Day of Week
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.charts.dayOfWeekActivity.map((item) => ({
                ...item,
                dayName: DAY_NAMES[item.day],
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="dayName"
                tick={{ fontSize: 12 }}
                stroke="#6B7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#000" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4">
          Top Users by Activity
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Username
                </th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-900">
                  Messages
                </th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-900">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">
                    {user.messageCount.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">
                    {formatCost(user.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h4 className="text-base font-bold text-gray-900 mb-4">
          Recent Sessions
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Title
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">
                  Model
                </th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-900">
                  Messages
                </th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-900">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentSessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-sm text-gray-900 truncate max-w-xs">
                    {session.title}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900">
                    {session.username}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {session.model.split('/')[1]}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">
                    {session.messageCount}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 text-right">
                    {formatCost(session.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 text-center">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  )
}
