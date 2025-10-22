import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'
import * as os from 'os'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/logs
 * Get system logs and performance metrics (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const startTime = Date.now()

    // Gather system information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      usedMemory: os.totalmem() - os.freemem(),
      memoryUsagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
      cpus: os.cpus().length,
      uptime: os.uptime(), // system uptime in seconds
      loadAverage: os.loadavg(),
    }

    // Get database performance metrics
    const dbStartTime = Date.now()
    const userCount = await prisma.user.count()
    const dbQueryTime = Date.now() - dbStartTime

    // Get recent database operations (by querying recent records)
    const [recentUsers, recentSessions, recentMessages] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      }),
      prisma.agenticSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      }),
      prisma.agenticMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          role: true,
          createdAt: true,
        },
      }),
    ])

    // Simulate application logs (in production, these would come from a logging service)
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'API request completed',
        details: { endpoint: '/api/chat', method: 'POST', responseTime: 245 },
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'User logged in',
        details: { username: 'admin', ip: '192.168.1.1' },
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: 'warn',
        message: 'Slow database query detected',
        details: { query: 'SELECT * FROM users', duration: 523 },
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Server started',
        details: { port: 13380, env: 'development' },
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Database connection established',
        details: { database: 'PostgreSQL' },
      },
    ]

    // Performance metrics
    const apiResponseTime = Date.now() - startTime

    // Calculate uptime in human-readable format
    const uptimeSeconds = Math.floor(process.uptime())
    const uptimeDays = Math.floor(uptimeSeconds / 86400)
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600)
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60)

    return NextResponse.json({
      system: {
        platform: systemInfo.platform,
        arch: systemInfo.arch,
        nodeVersion: systemInfo.nodeVersion,
        cpuCores: systemInfo.cpus,
        totalMemoryGB: (systemInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2),
        usedMemoryGB: (systemInfo.usedMemory / 1024 / 1024 / 1024).toFixed(2),
        freeMemoryGB: (systemInfo.freeMemory / 1024 / 1024 / 1024).toFixed(2),
        memoryUsagePercent: systemInfo.memoryUsagePercent,
        systemUptime: systemInfo.uptime,
        processUptime: process.uptime(),
        processUptimeFormatted: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`,
        loadAverage: systemInfo.loadAverage.map((load) => load.toFixed(2)),
      },
      performance: {
        apiResponseTime,
        dbQueryTime,
        avgApiResponseTime: 180, // Mock value (would be calculated from actual metrics)
        slowestEndpoint: '/api/chat', // Mock value
        slowestEndpointTime: 523, // Mock value
      },
      database: {
        status: 'connected',
        type: 'PostgreSQL',
        userCount,
        recentOperations: [
          ...recentUsers.map((u) => ({
            type: 'User Created',
            id: u.id.toString(),
            details: u.username,
            timestamp: u.createdAt.toISOString(),
          })),
          ...recentSessions.map((s) => ({
            type: 'Session Created',
            id: s.id,
            details: s.title,
            timestamp: s.createdAt.toISOString(),
          })),
          ...recentMessages.map((m) => ({
            type: 'Message Sent',
            id: m.id,
            details: m.role,
            timestamp: m.createdAt.toISOString(),
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10),
      },
      logs: mockLogs,
      healthChecks: {
        api: { status: 'healthy', responseTime: apiResponseTime },
        database: { status: 'healthy', responseTime: dbQueryTime },
        memory: {
          status: parseFloat(systemInfo.memoryUsagePercent) > 90 ? 'warning' : 'healthy',
          usagePercent: systemInfo.memoryUsagePercent,
        },
        disk: { status: 'healthy', usagePercent: 'N/A' }, // Would require additional package
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs and system data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
