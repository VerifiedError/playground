import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/security/events
 *
 * Returns security events with filtering:
 * - Failed logins
 * - Rate limit violations
 * - Suspicious activity
 * - Brute force attempts
 * - Unauthorized access attempts
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
    const eventType = searchParams.get('eventType') // Filter by event type
    const severity = searchParams.get('severity') // Filter by severity
    const isResolved = searchParams.get('isResolved') // Filter by resolution status
    const ipAddress = searchParams.get('ipAddress') // Filter by IP
    const userId = searchParams.get('userId') // Filter by user ID
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
      firstSeen: {
        gte: startDate,
      },
    }

    if (eventType) where.eventType = eventType
    if (severity) where.severity = severity
    if (isResolved !== null) where.isResolved = isResolved === 'true'
    if (ipAddress) where.ipAddress = { contains: ipAddress }
    if (userId) where.userId = parseInt(userId)

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          lastSeen: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ])

    // Get summary statistics
    const stats = await prisma.securityEvent.groupBy({
      by: ['eventType', 'severity'],
      where: {
        firstSeen: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        attemptCount: true,
      },
    })

    // Get top offending IPs
    const topIPs = await prisma.securityEvent.groupBy({
      by: ['ipAddress'],
      where: {
        firstSeen: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        attemptCount: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // Get unresolved critical events
    const criticalUnresolved = await prisma.securityEvent.count({
      where: {
        severity: 'critical',
        isResolved: false,
      },
    })

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      events: events.map((event) => ({
        id: event.id,
        userId: event.userId,
        user: event.user,
        eventType: event.eventType,
        severity: event.severity,
        description: event.description,
        details: event.details ? JSON.parse(event.details) : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        country: event.country,
        isVpn: event.isVpn,
        isTor: event.isTor,
        attemptCount: event.attemptCount,
        targetResource: event.targetResource,
        attackVector: event.attackVector,
        actionTaken: event.actionTaken,
        isResolved: event.isResolved,
        resolvedAt: event.resolvedAt,
        resolvedBy: event.resolvedBy,
        firstSeen: event.firstSeen,
        lastSeen: event.lastSeen,
      })),
      summary: {
        totalEvents: total,
        criticalUnresolved,
        byType: stats.reduce((acc: any, item) => {
          if (!acc[item.eventType]) {
            acc[item.eventType] = {
              total: 0,
              attempts: 0,
              bySeverity: {},
            }
          }
          acc[item.eventType].total += item._count.id
          acc[item.eventType].attempts += item._sum.attemptCount || 0
          acc[item.eventType].bySeverity[item.severity] = item._count.id
          return acc
        }, {}),
        topIPs: topIPs.map((item) => ({
          ipAddress: item.ipAddress,
          eventCount: item._count.id,
          totalAttempts: item._sum.attemptCount || 0,
        })),
      },
    })
  } catch (error: any) {
    console.error('[API] Security events error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch security events' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/security/events/:id
 *
 * Mark a security event as resolved
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = session.user as { role?: string; id?: number }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, isResolved } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Update event
    const event = await prisma.securityEvent.update({
      where: { id },
      data: {
        isResolved,
        resolvedAt: isResolved ? new Date() : null,
        resolvedBy: isResolved ? user.id : null,
      },
    })

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error: any) {
    console.error('[API] Update security event error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update security event' },
      { status: 500 }
    )
  }
}
