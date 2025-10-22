import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/analytics/limits
 * Fetch user's cost limits
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

    // Get or create cost limits
    let costLimit = await prisma.userCostLimit.findUnique({
      where: { userId: user.id },
    })

    if (!costLimit) {
      // Create default limits if they don't exist
      costLimit = await prisma.userCostLimit.create({
        data: {
          userId: user.id,
          dailyLimit: 0.0,
          weeklyLimit: 0.0,
          monthlyLimit: 0.0,
          sessionLimit: 0.0,
          emailAlerts: true,
        },
      })
    }

    return NextResponse.json(costLimit)
  } catch (error) {
    console.error('[GET /api/analytics/limits] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost limits' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/analytics/limits
 * Update user's cost limits
 */
export async function PATCH(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { dailyLimit, weeklyLimit, monthlyLimit, sessionLimit, emailAlerts } = body

    // Upsert cost limits
    const costLimit = await prisma.userCostLimit.upsert({
      where: { userId: user.id },
      update: {
        dailyLimit: dailyLimit !== undefined ? dailyLimit : undefined,
        weeklyLimit: weeklyLimit !== undefined ? weeklyLimit : undefined,
        monthlyLimit: monthlyLimit !== undefined ? monthlyLimit : undefined,
        sessionLimit: sessionLimit !== undefined ? sessionLimit : undefined,
        emailAlerts: emailAlerts !== undefined ? emailAlerts : undefined,
      },
      create: {
        userId: user.id,
        dailyLimit: dailyLimit ?? 0.0,
        weeklyLimit: weeklyLimit ?? 0.0,
        monthlyLimit: monthlyLimit ?? 0.0,
        sessionLimit: sessionLimit ?? 0.0,
        emailAlerts: emailAlerts ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      limits: costLimit,
    })
  } catch (error) {
    console.error('[PATCH /api/analytics/limits] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update cost limits' },
      { status: 500 }
    )
  }
}
