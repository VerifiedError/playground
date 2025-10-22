import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/sessions
 * Get all sessions with user information (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    // Fetch all sessions with user info and message counts
    const sessions = await prisma.agenticSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Transform to match expected interface
    const transformedSessions = sessions.map((session) => ({
      id: session.id,
      name: session.name,
      model: session.model,
      messageCount: session._count.messages,
      totalCost: session.totalCost,
      inputTokens: session.inputTokens,
      outputTokens: session.outputTokens,
      cachedTokens: session.cachedTokens,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      user: {
        id: session.user.id,
        username: session.user.username,
      },
    }))

    return NextResponse.json({
      sessions: transformedSessions,
      total: transformedSessions.length,
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
