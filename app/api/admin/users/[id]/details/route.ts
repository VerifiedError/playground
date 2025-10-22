import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/users/[id]/details
 *
 * Returns comprehensive per-user tracking data:
 * - Activity timeline (audit logs)
 * - Login history
 * - Session statistics
 * - Model usage breakdown
 * - Usage patterns (peak hours, days)
 * - Risk indicators (failed logins, suspicious activity)
 * - Cost breakdown by day
 * - Messages by hour
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get activity timeline (last 100 audit logs)
    const activityTimeline = await prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
      select: {
        id: true,
        action: true,
        category: true,
        severity: true,
        description: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
      },
    })

    // Get login history (extract from audit logs)
    const loginLogs = await prisma.auditLog.findMany({
      where: {
        userId,
        action: {
          in: ['user.login', 'user.login.failed'],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
        metadata: true,
      },
    })

    const loginHistory = loginLogs.map((log) => {
      const metadata = log.metadata ? JSON.parse(log.metadata) : {}
      return {
        id: log.id,
        ipAddress: log.ipAddress || 'Unknown',
        userAgent: log.userAgent,
        country: metadata.country || null,
        browser: metadata.browser || null,
        device: metadata.device || null,
        success: log.action === 'user.login',
        timestamp: log.timestamp,
      }
    })

    // Get session statistics
    const sessions = await prisma.agenticSession.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        messageCount: true,
        totalCost: true,
        createdAt: true,
        updatedAt: true,
        model: true,
      },
    })

    const totalSessions = sessions.length
    const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0)
    const totalCost = sessions.reduce((sum, s) => sum + s.totalCost, 0)
    const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0
    const avgCostPerSession = totalSessions > 0 ? totalCost / totalSessions : 0

    // Calculate average session duration (time between first and last message)
    const sessionDurations = await Promise.all(
      sessions.map(async (session) => {
        const messages = await prisma.agenticMessage.findMany({
          where: {
            sessionId: session.id,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            createdAt: true,
          },
        })

        if (messages.length < 2) return 0

        const first = messages[0].createdAt
        const last = messages[messages.length - 1].createdAt
        const durationMs = last.getTime() - first.getTime()
        return durationMs / 60000 // Convert to minutes
      })
    )

    const avgSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
        : 0

    const lastSession = sessions.length > 0 ? sessions[0].updatedAt : null

    const sessionStats = {
      totalSessions,
      totalMessages,
      totalCost,
      avgMessagesPerSession,
      avgCostPerSession,
      avgSessionDuration,
      lastSessionAt: lastSession,
    }

    // Get model usage breakdown
    const modelUsageMap = new Map<string, { sessions: number; messages: number; cost: number }>()

    sessions.forEach((session) => {
      const model = session.model || 'Unknown'
      const existing = modelUsageMap.get(model) || { sessions: 0, messages: 0, cost: 0 }
      modelUsageMap.set(model, {
        sessions: existing.sessions + 1,
        messages: existing.messages + session.messageCount,
        cost: existing.cost + session.totalCost,
      })
    })

    const modelUsage = Array.from(modelUsageMap.entries()).map(([model, stats]) => ({
      model,
      sessions: stats.sessions,
      messages: stats.messages,
      cost: stats.cost,
      percentage: totalSessions > 0 ? (stats.sessions / totalSessions) * 100 : 0,
    }))

    // Get usage patterns
    const messages = await prisma.agenticMessage.findMany({
      where: {
        session: {
          userId,
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Calculate hourly activity
    const hourCounts = new Array(24).fill(0)
    const dayCounts = new Array(7).fill(0)

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt)
      hourCounts[date.getHours()]++
      dayCounts[date.getDay()]++
    })

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    const peakDay = dayCounts.indexOf(Math.max(...dayCounts))

    // Calculate unique days active
    const uniqueDays = new Set(
      messages.map((msg) => new Date(msg.createdAt).toDateString())
    ).size

    // Calculate total hours active (approximate: count unique hour blocks)
    const uniqueHours = new Set(
      messages.map((msg) => {
        const date = new Date(msg.createdAt)
        return `${date.toDateString()}-${date.getHours()}`
      })
    ).size

    const avgDailyMessages = uniqueDays > 0 ? messages.length / uniqueDays : 0

    const usagePatterns = {
      peakHour,
      peakDay,
      totalHoursActive: uniqueHours,
      daysActive: uniqueDays,
      avgDailyMessages,
    }

    // Get cost by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSessions = await prisma.agenticSession.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        totalCost: true,
        createdAt: true,
      },
    })

    const costByDayMap = new Map<string, number>()
    recentSessions.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString()
      costByDayMap.set(date, (costByDayMap.get(date) || 0) + session.totalCost)
    })

    const costByDay = Array.from(costByDayMap.entries())
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Messages by hour
    const messagesByHour = hourCounts.map((count, hour) => ({ hour, count }))

    // Calculate risk indicators
    const failedLoginAttempts = loginHistory.filter((login) => !login.success).length

    // Get security events for this user
    const securityEvents = await prisma.securityEvent.findMany({
      where: {
        userId,
        isResolved: false,
      },
    })

    const suspiciousActivity = securityEvents.length

    // Calculate risk score (0-100)
    let riskScore = 0
    const riskFactors: Array<{
      factor: string
      severity: 'info' | 'warning' | 'danger'
      description: string
    }> = []

    // Factor 1: Failed login attempts
    if (failedLoginAttempts > 10) {
      riskScore += 40
      riskFactors.push({
        factor: 'High Failed Login Attempts',
        severity: 'danger',
        description: `${failedLoginAttempts} failed login attempts detected`,
      })
    } else if (failedLoginAttempts > 5) {
      riskScore += 20
      riskFactors.push({
        factor: 'Moderate Failed Login Attempts',
        severity: 'warning',
        description: `${failedLoginAttempts} failed login attempts detected`,
      })
    }

    // Factor 2: Suspicious activity
    if (suspiciousActivity > 5) {
      riskScore += 40
      riskFactors.push({
        factor: 'Multiple Security Events',
        severity: 'danger',
        description: `${suspiciousActivity} unresolved security events`,
      })
    } else if (suspiciousActivity > 0) {
      riskScore += 20
      riskFactors.push({
        factor: 'Security Events Detected',
        severity: 'warning',
        description: `${suspiciousActivity} unresolved security events`,
      })
    }

    // Factor 3: Unusual IP count
    const uniqueIPs = new Set(loginHistory.map((login) => login.ipAddress)).size
    if (uniqueIPs > 10) {
      riskScore += 20
      riskFactors.push({
        factor: 'Multiple IP Addresses',
        severity: 'warning',
        description: `Login attempts from ${uniqueIPs} different IP addresses`,
      })
    }

    // Determine risk level
    let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'safe'
    if (riskScore >= 80) riskLevel = 'critical'
    else if (riskScore >= 60) riskLevel = 'high'
    else if (riskScore >= 40) riskLevel = 'medium'
    else if (riskScore >= 20) riskLevel = 'low'

    const riskIndicators = {
      score: riskScore,
      level: riskLevel,
      factors: riskFactors,
      failedLoginAttempts,
      suspiciousActivity,
    }

    return NextResponse.json({
      activityTimeline,
      loginHistory,
      sessionStats,
      modelUsage,
      usagePatterns,
      riskIndicators,
      costByDay,
      messagesByHour,
    })
  } catch (error: any) {
    console.error('[API] User details error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}
