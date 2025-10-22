import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/sessions/[id]/branch - Branch conversation from specific message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sessionId } = await params
    const body = await request.json()
    const { branchPoint } = body // Message index to branch from

    // Validate branchPoint
    if (typeof branchPoint !== 'number' || branchPoint < 0) {
      return NextResponse.json(
        { error: 'Invalid branch point' },
        { status: 400 }
      )
    }

    // Fetch original session with messages
    const originalSession = await prisma.agenticSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!originalSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify ownership
    if (originalSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate branch point is within message count
    if (branchPoint >= originalSession.messages.length) {
      return NextResponse.json(
        { error: 'Branch point exceeds message count' },
        { status: 400 }
      )
    }

    // Get messages up to branch point (inclusive)
    const messagesToCopy = originalSession.messages.slice(0, branchPoint + 1)

    // Calculate cost and tokens for branched messages
    const branchCost = messagesToCopy.reduce((sum, msg) => sum + msg.cost, 0)
    const branchInputTokens = messagesToCopy.reduce((sum, msg) => sum + msg.inputTokens, 0)
    const branchOutputTokens = messagesToCopy.reduce((sum, msg) => sum + msg.outputTokens, 0)
    const branchCachedTokens = messagesToCopy.reduce((sum, msg) => sum + msg.cachedTokens, 0)

    // Create new branched session
    const branchedSession = await prisma.agenticSession.create({
      data: {
        userId: session.user.id,
        title: `${originalSession.title} (branch)`,
        model: originalSession.model,
        settings: originalSession.settings,
        totalCost: branchCost,
        inputTokens: branchInputTokens,
        outputTokens: branchOutputTokens,
        cachedTokens: branchCachedTokens,
        messageCount: messagesToCopy.length,
        // Branch metadata
        parentSessionId: sessionId,
        branchPoint: branchPoint,
        // Copy organization fields
        folderId: originalSession.folderId,
        tags: originalSession.tags,
        isStarred: false, // Don't inherit starred status
        isArchived: false,
        isTemplate: false,
      },
    })

    // Copy messages to new session
    const newMessages = await prisma.agenticMessage.createMany({
      data: messagesToCopy.map((msg) => ({
        sessionId: branchedSession.id,
        role: msg.role,
        content: msg.content,
        cost: msg.cost,
        inputTokens: msg.inputTokens,
        outputTokens: msg.outputTokens,
        cachedTokens: msg.cachedTokens,
        toolCalls: msg.toolCalls,
        attachments: msg.attachments,
        reasoning: msg.reasoning,
      })),
    })

    // Fetch complete branched session with messages
    const completeBranchedSession = await prisma.agenticSession.findUnique({
      where: { id: branchedSession.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      session: completeBranchedSession,
      branchInfo: {
        parentSessionId: sessionId,
        branchPoint: branchPoint,
        messagesCopied: messagesToCopy.length,
      },
    })
  } catch (error: any) {
    console.error('Branch session error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
