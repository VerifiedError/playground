import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/audit/logs
 *
 * Returns comprehensive audit logs with filtering:
 * - All user actions
 * - System events
 * - Admin actions
 * - API calls
 * - Resource changes
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const action = searchParams.get('action') // Filter by action
    const category = searchParams.get('category') // Filter by category
    const severity = searchParams.get('severity') // Filter by severity
    const userId = searchParams.get('userId') // Filter by user ID
    const resourceType = searchParams.get('resourceType') // Filter by resource type
    const resourceId = searchParams.get('resourceId') // Filter by resource ID
    const ipAddress = searchParams.get('ipAddress') // Filter by IP
    const search = searchParams.get('search') // Search in description
    const timeRange = searchParams.get('timeRange') || '7d' // 24h, 7d, 30d, 90d, all

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
      case 'all':
        startDate = new Date('2020-01-01')
        break
    }

    // Build where clause
    const where: any = {
      timestamp: {
        gte: startDate,
      },
    }

    if (action) where.action = { contains: action }
    if (category) where.category = category
    if (severity) where.severity = severity
    if (userId) where.userId = parseInt(userId)
    if (resourceType) where.resourceType = resourceType
    if (resourceId) where.resourceId = resourceId
    if (ipAddress) where.ipAddress = { contains: ipAddress }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    // Get summary statistics
    const stats = await prisma.auditLog.groupBy({
      by: ['category', 'severity'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Get most active users
    const activeUsers = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: startDate,
        },
        userId: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // Get user details for active users
    const userIds = activeUsers.map((u) => u.userId!)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    })

    // Get most common actions
    const commonActions = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // Get API endpoint usage
    const apiUsage = await prisma.auditLog.groupBy({
      by: ['requestPath'],
      where: {
        timestamp: {
          gte: startDate,
        },
        category: 'api',
        requestPath: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        responseTime: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        user: log.user,
        action: log.action,
        category: log.category,
        severity: log.severity,
        description: log.description,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        requestMethod: log.requestMethod,
        requestPath: log.requestPath,
        statusCode: log.statusCode,
        responseTime: log.responseTime,
        changesBefore: log.changesBefore ? JSON.parse(log.changesBefore) : null,
        changesAfter: log.changesAfter ? JSON.parse(log.changesAfter) : null,
        timestamp: log.timestamp,
      })),
      summary: {
        totalLogs: total,
        byCategory: stats.reduce((acc: any, item) => {
          if (!acc[item.category]) {
            acc[item.category] = {
              total: 0,
              bySeverity: {},
            }
          }
          acc[item.category].total += item._count.id
          acc[item.category].bySeverity[item.severity] = item._count.id
          return acc
        }, {}),
        activeUsers: activeUsers.map((item) => {
          const user = users.find((u) => u.id === item.userId)
          return {
            userId: item.userId,
            username: user?.username,
            email: user?.email,
            role: user?.role,
            actionCount: item._count.id,
          }
        }),
        commonActions: commonActions.map((item) => ({
          action: item.action,
          count: item._count.id,
        })),
        apiUsage: apiUsage.map((item) => ({
          endpoint: item.requestPath,
          callCount: item._count.id,
          avgResponseTime: item._avg.responseTime,
        })),
      },
    })
  } catch (error: any) {
    console.error('[API] Audit logs error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
