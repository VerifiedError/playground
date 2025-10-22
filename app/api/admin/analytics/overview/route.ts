import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/overview
 *
 * Returns comprehensive analytics overview:
 * - Total searches by type
 * - Search trends over time
 * - Most popular queries
 * - Geographic distribution
 * - Device/browser stats
 * - AI chat usage
 * - Performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = session.user as { role?: string }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || '7d' // 24h, 7d, 30d, 90d, 1y, all
    const groupBy = searchParams.get('groupBy') || 'day' // hour, day, week, month

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date('2020-01-01') // Beginning of time for this app
        break
    }

    // Get total searches by type
    const searchesByType = await prisma.searchAnalytics.groupBy({
      by: ['searchType'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        apiCost: true,
        aiCost: true,
      },
    })

    // Get search trends over time (grouped by time period)
    const searchTrends = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${groupBy}, timestamp) as period,
        COUNT(*) as count,
        SUM(CAST(api_cost AS DECIMAL)) as total_api_cost,
        SUM(CAST(ai_cost AS DECIMAL)) as total_ai_cost
      FROM search_analytics
      WHERE timestamp >= ${startDate}
      GROUP BY period
      ORDER BY period ASC
    ` as Array<{
      period: Date
      count: bigint
      total_api_cost: number | null
      total_ai_cost: number | null
    }>

    // Get most popular queries
    const popularQueries = await prisma.$queryRaw`
      SELECT
        normalized_query as query,
        COUNT(*) as search_count,
        SUM(CASE WHEN has_results THEN 1 ELSE 0 END) as successful_searches,
        AVG(CAST(search_duration AS DECIMAL)) as avg_duration_ms
      FROM search_analytics
      WHERE timestamp >= ${startDate}
        AND normalized_query IS NOT NULL
      GROUP BY normalized_query
      ORDER BY search_count DESC
      LIMIT 20
    ` as Array<{
      query: string
      search_count: bigint
      successful_searches: bigint
      avg_duration_ms: number | null
    }>

    // Get geographic distribution
    const geoDistribution = await prisma.searchAnalytics.groupBy({
      by: ['country'],
      where: {
        timestamp: {
          gte: startDate,
        },
        country: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    })

    // Get device/browser stats
    const deviceStats = await prisma.searchAnalytics.groupBy({
      by: ['device', 'browser'],
      where: {
        timestamp: {
          gte: startDate,
        },
        device: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    })

    // Get AI chat usage stats
    const aiChatStats = await prisma.searchAnalytics.aggregate({
      where: {
        timestamp: {
          gte: startDate,
        },
        usedAiChat: true,
      },
      _count: {
        id: true,
      },
      _sum: {
        aiMessages: true,
        aiCost: true,
      },
      _avg: {
        aiMessages: true,
        aiCost: true,
      },
    })

    // Get performance metrics
    const performanceMetrics = await prisma.searchAnalytics.aggregate({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _avg: {
        searchDuration: true,
        timeOnResults: true,
      },
      _count: {
        id: true,
      },
    })

    // Get cache hit rate
    const cacheStats = await prisma.searchAnalytics.groupBy({
      by: ['cached'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Calculate totals
    const totalSearches = searchesByType.reduce((sum, item) => sum + item._count.id, 0)
    const totalApiCost = searchesByType.reduce((sum, item) => sum + (item._sum.apiCost || 0), 0)
    const totalAiCost = searchesByType.reduce((sum, item) => sum + (item._sum.aiCost || 0), 0)

    return NextResponse.json({
      success: true,
      timeRange,
      groupBy,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      overview: {
        totalSearches,
        totalCost: totalApiCost + totalAiCost,
        apiCost: totalApiCost,
        aiCost: totalAiCost,
        avgSearchDuration: performanceMetrics._avg.searchDuration,
        avgTimeOnResults: performanceMetrics._avg.timeOnResults,
      },
      searchesByType: searchesByType.map((item) => ({
        type: item.searchType,
        count: item._count.id,
        apiCost: item._sum.apiCost || 0,
        aiCost: item._sum.aiCost || 0,
      })),
      trends: searchTrends.map((item) => ({
        period: item.period,
        count: Number(item.count),
        apiCost: item.total_api_cost || 0,
        aiCost: item.total_ai_cost || 0,
      })),
      popularQueries: popularQueries.map((item) => ({
        query: item.query,
        searchCount: Number(item.search_count),
        successRate: Number(item.successful_searches) / Number(item.search_count),
        avgDuration: item.avg_duration_ms,
      })),
      geoDistribution: geoDistribution.map((item) => ({
        country: item.country,
        count: item._count.id,
      })),
      deviceStats: deviceStats.map((item) => ({
        device: item.device,
        browser: item.browser,
        count: item._count.id,
      })),
      aiChat: {
        totalSessions: aiChatStats._count.id,
        totalMessages: aiChatStats._sum.aiMessages || 0,
        totalCost: aiChatStats._sum.aiCost || 0,
        avgMessages: aiChatStats._avg.aiMessages || 0,
        avgCost: aiChatStats._avg.aiCost || 0,
      },
      caching: {
        cached: cacheStats.find((s) => s.cached)?._count.id || 0,
        notCached: cacheStats.find((s) => !s.cached)?._count.id || 0,
        hitRate: cacheStats.find((s) => s.cached)
          ? cacheStats.find((s) => s.cached)!._count.id / totalSearches
          : 0,
      },
    })
  } catch (error: any) {
    console.error('[API] Analytics overview error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
