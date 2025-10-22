import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/analytics/user
 * Fetch analytics data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all sessions for analytics
    const sessions = await prisma.agenticSession.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        model: true,
        totalCost: true,
        inputTokens: true,
        outputTokens: true,
        cachedTokens: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals
    const totalSessions = sessions.length
    const totalCost = sessions.reduce((sum, s) => sum + s.totalCost, 0)
    const totalInputTokens = sessions.reduce((sum, s) => sum + s.inputTokens, 0)
    const totalOutputTokens = sessions.reduce((sum, s) => sum + s.outputTokens, 0)
    const totalCachedTokens = sessions.reduce((sum, s) => sum + s.cachedTokens, 0)
    const totalTokens = totalInputTokens + totalOutputTokens + totalCachedTokens
    const avgCostPerSession = totalSessions > 0 ? totalCost / totalSessions : 0
    const avgTokensPerSession = totalSessions > 0 ? totalTokens / totalSessions : 0

    // Get recent sessions (last 10)
    const recentSessions = sessions.slice(0, 10).map((s) => ({
      id: s.id,
      name: s.title,
      model: s.model,
      messageCount: s.messageCount,
      totalCost: s.totalCost,
      createdAt: s.createdAt.toISOString(),
    }))

    // Group cost by date (last 30 days)
    const costByDate = sessions.reduce((acc, s) => {
      const date = new Date(s.createdAt).toISOString().split('T')[0] // YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += s.totalCost
      return acc
    }, {} as Record<string, number>)

    const costByDateArray = Object.entries(costByDate)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Last 30 days

    // Group cost by model
    const costByModel = sessions.reduce((acc, s) => {
      if (!acc[s.model]) {
        acc[s.model] = { cost: 0, count: 0 }
      }
      acc[s.model].cost += s.totalCost
      acc[s.model].count += 1
      return acc
    }, {} as Record<string, { cost: number; count: number }>)

    const costByModelArray = Object.entries(costByModel)
      .map(([model, data]) => ({ model, cost: data.cost, count: data.count }))
      .sort((a, b) => b.cost - a.cost)

    return NextResponse.json({
      totalSessions,
      totalCost,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCachedTokens,
      avgCostPerSession,
      avgTokensPerSession,
      recentSessions,
      costByDate: costByDateArray,
      costByModel: costByModelArray,
    })
  } catch (error) {
    console.error('[GET /api/analytics/user] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
