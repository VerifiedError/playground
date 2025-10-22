'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, BarChart3, DollarSign, Coins, Grid2x2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
// Mobile tabs (fixed - removed framer-motion and date-fns circular dependencies)
import { MobileTabs, Tab } from '@/components/analytics/mobile-tabs'
import { OverviewTab } from '@/components/analytics/overview-tab'
import { CostTab } from '@/components/analytics/cost-tab'
import { TokensTab } from '@/components/analytics/tokens-tab'
import { ModelsTab } from '@/components/analytics/models-tab'
import { SessionsTab } from '@/components/analytics/sessions-tab'

// Desktop components
import { UsageStats } from '@/components/analytics/usage-stats'
import { CostChart } from '@/components/analytics/cost-chart'
import { ModelDistribution } from '@/components/analytics/model-distribution'
import { TokenDistribution } from '@/components/analytics/token-distribution'
import { SessionsTable } from '@/components/analytics/sessions-table'

interface AnalyticsData {
  totalSessions: number
  totalCost: number
  totalTokens: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCachedTokens: number
  avgCostPerSession: number
  avgTokensPerSession: number
  recentSessions: Array<{
    id: string
    name: string
    model: string
    messageCount: number
    totalCost: number
    createdAt: string
  }>
  costByDate: Array<{
    date: string
    cost: number
  }>
  costByModel: Array<{
    model: string
    cost: number
    count: number
  }>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/analytics/user')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </div>
      </div>
    )
  }

  const handleSessionClick = (sessionId: string) => {
    router.push(`/?session=${sessionId}`)
  }

  // Mobile tabs (fixed - removed framer-motion and date-fns)
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      content: (
        <OverviewTab
          totalSessions={analytics.totalSessions}
          totalCost={analytics.totalCost}
          totalTokens={analytics.totalTokens}
          avgCostPerSession={analytics.avgCostPerSession}
          costByDate={analytics.costByDate}
          costByModel={analytics.costByModel}
          recentSessions={analytics.recentSessions}
        />
      )
    },
    {
      id: 'cost',
      label: 'Cost',
      icon: DollarSign,
      content: (
        <CostTab
          totalCost={analytics.totalCost}
          costByDate={analytics.costByDate}
          costByModel={analytics.costByModel}
        />
      )
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: Coins,
      content: (
        <TokensTab
          totalTokens={analytics.totalTokens}
          totalInputTokens={analytics.totalInputTokens}
          totalOutputTokens={analytics.totalOutputTokens}
          totalCachedTokens={analytics.totalCachedTokens}
          avgTokensPerSession={analytics.avgTokensPerSession}
        />
      )
    },
    {
      id: 'models',
      label: 'Models',
      icon: Grid2x2,
      content: (
        <ModelsTab
          costByModel={analytics.costByModel}
          totalCost={analytics.totalCost}
          totalSessions={analytics.totalSessions}
        />
      )
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: MessageSquare,
      content: (
        <SessionsTab
          sessions={analytics.recentSessions}
          onSessionClick={handleSessionClick}
        />
      )
    }
  ]

  return (
    <>
      {/* Mobile Layout - Fixed webpack circular dependency */}
      <div className="lg:hidden h-[100dvh] flex flex-col bg-background">
        <div className="border-b-2 border-black bg-card flex-shrink-0">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Analytics</h1>
              <p className="text-xs text-muted-foreground">Usage & cost tracking</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <MobileTabs tabs={tabs} defaultTab="overview" />
        </div>
      </div>

      {/* Desktop Layout - Compact Grid (No Scroll) */}
      <div className="hidden lg:flex lg:flex-col lg:h-[100dvh] bg-gray-50">
        {/* Desktop Header - Fixed */}
        <div className="border-b-2 border-black bg-white flex-shrink-0">
          <div className="px-6 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-black"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              <p className="text-xs text-gray-600">Usage & cost tracking</p>
            </div>
          </div>
        </div>

        {/* Desktop Content - Grid Layout (Fills remaining viewport) */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full grid grid-cols-12 gap-4">
            {/* Left Column: Stats (4 cards stacked) */}
            <div className="col-span-3 flex flex-col gap-3">
              <UsageStats
                totalSessions={analytics.totalSessions}
                totalCost={analytics.totalCost}
                totalTokens={analytics.totalTokens}
                avgCostPerSession={analytics.avgCostPerSession}
              />
            </div>

            {/* Middle Column: Cost Chart */}
            <div className="col-span-4 border-2 border-black rounded-lg bg-white p-4 flex flex-col">
              <div className="mb-2">
                <h2 className="text-sm font-bold text-gray-900">Cost Trend</h2>
                <p className="text-xs text-gray-600">Last 30 days</p>
              </div>
              <div className="flex-1 min-h-0">
                {analytics.costByDate.length > 0 ? (
                  <CostChart data={analytics.costByDate} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    No data
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Model Distribution */}
            <div className="col-span-5 border-2 border-black rounded-lg bg-white p-4 flex flex-col">
              <div className="mb-2">
                <h2 className="text-sm font-bold text-gray-900">Model Usage</h2>
                <p className="text-xs text-gray-600">Cost by model</p>
              </div>
              <div className="flex-1 min-h-0">
                {analytics.costByModel.length > 0 ? (
                  <ModelDistribution data={analytics.costByModel} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    No data
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Token Distribution + Sessions Table */}
            <div className="col-span-5 border-2 border-black rounded-lg bg-white p-4 flex flex-col">
              <div className="mb-2">
                <h2 className="text-sm font-bold text-gray-900">Token Distribution</h2>
                <p className="text-xs text-gray-600">Input, output & cached</p>
              </div>
              <div className="flex-1 min-h-0">
                <TokenDistribution
                  inputTokens={analytics.totalInputTokens}
                  outputTokens={analytics.totalOutputTokens}
                  cachedTokens={analytics.totalCachedTokens}
                />
              </div>
            </div>

            <div className="col-span-7 border-2 border-black rounded-lg bg-white flex flex-col overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-gray-50 flex-shrink-0">
                <h2 className="text-sm font-bold text-gray-900">Recent Sessions</h2>
                <p className="text-xs text-gray-600">Last 10 conversations</p>
              </div>
              <div className="flex-1 overflow-auto">
                <SessionsTable
                  sessions={analytics.recentSessions}
                  onSessionClick={handleSessionClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
