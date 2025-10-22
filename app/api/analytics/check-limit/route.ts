import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/analytics/check-limit
 * Check user's current usage against cost limits
 * Returns warnings and blocks based on thresholds
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

    // Get cost limits
    const costLimit = await prisma.userCostLimit.findUnique({
      where: { userId: user.id },
    })

    if (!costLimit) {
      // No limits set, allow all
      return NextResponse.json({
        allowed: true,
        warnings: [],
        blocks: [],
      })
    }

    // Calculate date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch sessions for each period
    const [todaySessions, weekSessions, monthSessions] = await Promise.all([
      prisma.agenticSession.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: todayStart },
        },
        select: { totalCost: true },
      }),
      prisma.agenticSession.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: weekStart },
        },
        select: { totalCost: true },
      }),
      prisma.agenticSession.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: monthStart },
        },
        select: { totalCost: true },
      }),
    ])

    // Calculate totals
    const dailyCost = todaySessions.reduce((sum, s) => sum + s.totalCost, 0)
    const weeklyCost = weekSessions.reduce((sum, s) => sum + s.totalCost, 0)
    const monthlyCost = monthSessions.reduce((sum, s) => sum + s.totalCost, 0)

    // Check limits and generate warnings/blocks
    const warnings: string[] = []
    const blocks: string[] = []

    // Daily limit check
    if (costLimit.dailyLimit > 0) {
      const dailyPercent = (dailyCost / costLimit.dailyLimit) * 100
      if (dailyPercent >= 100) {
        blocks.push(`Daily limit exceeded: $${dailyCost.toFixed(4)} / $${costLimit.dailyLimit.toFixed(2)}`)
      } else if (dailyPercent >= 80) {
        warnings.push(`Daily limit warning: $${dailyCost.toFixed(4)} / $${costLimit.dailyLimit.toFixed(2)} (${dailyPercent.toFixed(0)}%)`)
      }
    }

    // Weekly limit check
    if (costLimit.weeklyLimit > 0) {
      const weeklyPercent = (weeklyCost / costLimit.weeklyLimit) * 100
      if (weeklyPercent >= 100) {
        blocks.push(`Weekly limit exceeded: $${weeklyCost.toFixed(4)} / $${costLimit.weeklyLimit.toFixed(2)}`)
      } else if (weeklyPercent >= 80) {
        warnings.push(`Weekly limit warning: $${weeklyCost.toFixed(4)} / $${costLimit.weeklyLimit.toFixed(2)} (${weeklyPercent.toFixed(0)}%)`)
      }
    }

    // Monthly limit check
    if (costLimit.monthlyLimit > 0) {
      const monthlyPercent = (monthlyCost / costLimit.monthlyLimit) * 100
      if (monthlyPercent >= 100) {
        blocks.push(`Monthly limit exceeded: $${monthlyCost.toFixed(4)} / $${costLimit.monthlyLimit.toFixed(2)}`)
      } else if (monthlyPercent >= 80) {
        warnings.push(`Monthly limit warning: $${monthlyCost.toFixed(4)} / $${costLimit.monthlyLimit.toFixed(2)} (${monthlyPercent.toFixed(0)}%)`)
      }
    }

    return NextResponse.json({
      allowed: blocks.length === 0,
      warnings,
      blocks,
      usage: {
        daily: dailyCost,
        weekly: weeklyCost,
        monthly: monthlyCost,
      },
      limits: {
        daily: costLimit.dailyLimit,
        weekly: costLimit.weeklyLimit,
        monthly: costLimit.monthlyLimit,
        session: costLimit.sessionLimit,
      },
    })
  } catch (error) {
    console.error('[GET /api/analytics/check-limit] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check cost limits' },
      { status: 500 }
    )
  }
}
