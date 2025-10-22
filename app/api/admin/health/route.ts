import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/health
 * Get system health metrics (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const startTime = Date.now()

    // Test database connection and get simple query performance
    const dbConnectionStart = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      var dbStatus = 'healthy'
      var dbLatency = Date.now() - dbConnectionStart
    } catch (error) {
      var dbStatus = 'unhealthy'
      var dbLatency = -1
    }

    // Get memory usage (Node.js heap)
    const memoryUsage = process.memoryUsage()
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024)

    // Get uptime
    const uptimeSeconds = Math.floor(process.uptime())
    const uptimeDays = Math.floor(uptimeSeconds / (24 * 60 * 60))
    const uptimeHours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60))
    const uptimeMinutes = Math.floor((uptimeSeconds % (60 * 60)) / 60)

    // Get CPU usage (simplified - just process CPU percentage)
    const cpuUsage = process.cpuUsage()
    const cpuUserMicroseconds = cpuUsage.user
    const cpuSystemMicroseconds = cpuUsage.system
    const totalCpuMicroseconds = cpuUserMicroseconds + cpuSystemMicroseconds
    const cpuPercent = Math.round((totalCpuMicroseconds / 1000000 / uptimeSeconds) * 100)

    // Platform info
    const platform = process.platform
    const nodeVersion = process.version
    const architecture = process.arch

    // Response time for this request
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`,
      },
      database: {
        status: dbStatus,
        latency: dbLatency,
      },
      memory: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
        heapPercentage: Math.round((heapUsedMB / heapTotalMB) * 100),
      },
      cpu: {
        percent: cpuPercent > 100 ? 100 : cpuPercent, // Cap at 100%
      },
      system: {
        platform,
        nodeVersion,
        architecture,
      },
      responseTime,
    })
  } catch (error) {
    console.error('Error fetching health metrics:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch health metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
