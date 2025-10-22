import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/security
 * Get security and audit data (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    // Run all queries in parallel
    const [
      recentLogins,
      inactiveUsers,
      recentActivity,
      usersByRole,
      sessionsByDate,
    ] = await Promise.all([
      // Recent logins (last 20)
      prisma.user.findMany({
        where: {
          lastLoginAt: {
            not: null,
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          lastLoginAt: true,
          isActive: true,
        },
        orderBy: {
          lastLoginAt: 'desc',
        },
        take: 20,
      }),

      // Inactive users (no login in 30 days)
      prisma.user.findMany({
        where: {
          OR: [
            {
              lastLoginAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            {
              lastLoginAt: null,
            },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),

      // Recent activity (sessions created in last 24 hours)
      prisma.agenticSession.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          title: true,
          model: true,
          createdAt: true,
          user: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      }),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      }),

      // Sessions created per day (last 7 days)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM agentic_sessions
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
    ])

    // Calculate security metrics
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { isActive: true },
    })
    const lockedUsers = await prisma.user.count({
      where: { isActive: false },
    })

    // Get admin count
    const adminCount = usersByRole.find((g) => g.role === 'admin')?._count.role || 0

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers,
        lockedUsers,
        adminCount,
        inactiveUsersCount: inactiveUsers.length,
      },
      recentLogins: recentLogins.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        isActive: user.isActive,
      })),
      inactiveUsers: inactiveUsers.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        daysSinceLogin: user.lastLoginAt
          ? Math.floor((Date.now() - user.lastLoginAt.getTime()) / (24 * 60 * 60 * 1000))
          : null,
      })),
      recentActivity: recentActivity.map((session) => ({
        id: session.id,
        title: session.title,
        model: session.model,
        username: session.user.username,
        createdAt: session.createdAt.toISOString(),
      })),
      sessionsPerDay: (sessionsByDate as any[]).map((row) => ({
        date: row.date.toISOString().split('T')[0],
        count: Number(row.count),
      })),
      securitySettings: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSpecialChars: false,
        },
        rateLimiting: {
          enabled: true,
          maxAttempts: 5,
          windowMinutes: 15,
          blockDurationMinutes: 30,
        },
        sessionSecurity: {
          sessionTimeoutDays: 7,
          maxConcurrentSessions: null, // unlimited
        },
        accountSecurity: {
          requireEmailVerification: false,
          mfaEnabled: false,
          autoLockAfterDays: null, // never auto-lock
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching security data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
