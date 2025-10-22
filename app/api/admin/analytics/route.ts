import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'
import { startOfDay, subDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics
 * Get analytics data with time-series for charts (admin only)
 *
 * Query parameters:
 * - days: number of days to include (default: 30)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const now = new Date()
    const startDate = startOfDay(subDays(now, days - 1))

    // Run all queries in parallel
    const [
      messagesByDay,
      sessionsByDay,
      costByDay,
      userActivity,
      modelDistribution,
      costByModel,
      messagesByHour,
      messagesByDayOfWeek,
      recentSessions,
      topUsers,
    ] = await Promise.all([
      // Messages by day (for line chart)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM agentic_messages
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Sessions by day (for bar chart)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM agentic_sessions
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Cost by day (for area chart)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          SUM(total_cost) as cost
        FROM agentic_sessions
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // User activity by day (unique users who created sessions)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as active_users
        FROM agentic_sessions
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Model distribution (for pie chart)
      prisma.agenticSession.groupBy({
        by: ['model'],
        _count: {
          model: true,
        },
        _sum: {
          totalCost: true,
        },
        orderBy: {
          _count: {
            model: 'desc',
          },
        },
      }),

      // Cost breakdown by model (for pie chart)
      prisma.agenticSession.groupBy({
        by: ['model'],
        _sum: {
          totalCost: true,
        },
        orderBy: {
          _sum: {
            totalCost: 'desc',
          },
        },
      }),

      // Messages by hour of day (for heatmap)
      prisma.$queryRaw`
        SELECT
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as count
        FROM agentic_messages
        WHERE created_at >= ${startDate}
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour ASC
      `,

      // Messages by day of week (for bar chart)
      prisma.$queryRaw`
        SELECT
          EXTRACT(DOW FROM created_at) as day_of_week,
          COUNT(*) as count
        FROM agentic_messages
        WHERE created_at >= ${startDate}
        GROUP BY EXTRACT(DOW FROM created_at)
        ORDER BY day_of_week ASC
      `,

      // Recent sessions (last 10)
      prisma.agenticSession.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),

      // Top users by message count
      prisma.$queryRaw`
        SELECT
          u.id,
          u.username,
          COUNT(m.id) as message_count,
          SUM(s.total_cost) as total_cost
        FROM users u
        LEFT JOIN agentic_sessions s ON s.user_id = u.id
        LEFT JOIN agentic_messages m ON m.session_id = s.id
        GROUP BY u.id, u.username
        ORDER BY message_count DESC
        LIMIT 10
      `,
    ])

    // Format data for charts
    const messagesOverTime = (messagesByDay as any[]).map((row) => ({
      date: format(new Date(row.date), 'MMM dd'),
      count: Number(row.count),
    }))

    const sessionsOverTime = (sessionsByDay as any[]).map((row) => ({
      date: format(new Date(row.date), 'MMM dd'),
      count: Number(row.count),
    }))

    const costOverTime = (costByDay as any[]).map((row) => ({
      date: format(new Date(row.date), 'MMM dd'),
      cost: Number(row.cost || 0),
    }))

    const activeUsersOverTime = (userActivity as any[]).map((row) => ({
      date: format(new Date(row.date), 'MMM dd'),
      active_users: Number(row.active_users),
    }))

    const modelUsage = modelDistribution.map((stat) => ({
      model: stat.model,
      count: stat._count.model,
      cost: Number(stat._sum.totalCost || 0),
    }))

    const costDistribution = costByModel.map((stat) => ({
      model: stat.model,
      cost: Number(stat._sum.totalCost || 0),
    }))

    const hourlyActivity = (messagesByHour as any[]).map((row) => ({
      hour: Number(row.hour),
      count: Number(row.count),
    }))

    const dayOfWeekActivity = (messagesByDayOfWeek as any[]).map((row) => ({
      day: Number(row.day_of_week), // 0 = Sunday, 6 = Saturday
      count: Number(row.count),
    }))

    // Calculate summary stats
    const totalMessages = messagesOverTime.reduce((sum, day) => sum + day.count, 0)
    const totalCost = costOverTime.reduce((sum, day) => sum + day.cost, 0)
    const totalSessions = sessionsOverTime.reduce((sum, day) => sum + day.count, 0)
    const avgMessagesPerDay = totalMessages / days
    const avgCostPerDay = totalCost / days
    const avgSessionsPerDay = totalSessions / days

    return NextResponse.json({
      summary: {
        totalMessages,
        totalCost,
        totalSessions,
        avgMessagesPerDay: Math.round(avgMessagesPerDay),
        avgCostPerDay: avgCostPerDay.toFixed(4),
        avgSessionsPerDay: Math.round(avgSessionsPerDay),
      },
      charts: {
        messagesOverTime,
        sessionsOverTime,
        costOverTime,
        activeUsersOverTime,
        modelUsage,
        costDistribution,
        hourlyActivity,
        dayOfWeekActivity,
      },
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        title: session.title,
        model: session.model,
        username: session.user.username,
        messageCount: session._count.messages,
        cost: Number(session.totalCost),
        createdAt: session.createdAt.toISOString(),
      })),
      topUsers: (topUsers as any[]).map((user) => ({
        id: Number(user.id),
        username: user.username,
        messageCount: Number(user.message_count || 0),
        totalCost: Number(user.total_cost || 0),
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
