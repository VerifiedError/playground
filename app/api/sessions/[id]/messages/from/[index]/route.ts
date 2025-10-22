import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// DELETE /api/sessions/[id]/messages/from/[index] - Delete messages from index onward
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sessionId, index: indexStr } = await params
    const messageIndex = parseInt(indexStr, 10)

    if (isNaN(messageIndex) || messageIndex < 0) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 })
    }

    // Verify session exists and belongs to user
    const agenticSession = await prisma.agenticSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          where: { deletedAt: null }, // Only get non-deleted messages
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!agenticSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (agenticSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get messages to delete (from index onward)
    const messagesToDelete = agenticSession.messages.slice(messageIndex)

    if (messagesToDelete.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0 })
    }

    // Calculate cost and token delta
    const costDelta = messagesToDelete.reduce((sum, m) => sum + m.cost, 0)
    const inputTokensDelta = messagesToDelete.reduce((sum, m) => sum + m.inputTokens, 0)
    const outputTokensDelta = messagesToDelete.reduce((sum, m) => sum + m.outputTokens, 0)
    const cachedTokensDelta = messagesToDelete.reduce((sum, m) => sum + m.cachedTokens, 0)

    // Soft delete messages (set deletedAt timestamp)
    const messageIds = messagesToDelete.map((m) => m.id)
    await prisma.agenticMessage.updateMany({
      where: {
        id: { in: messageIds },
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Update session cost and message count
    await prisma.agenticSession.update({
      where: { id: sessionId },
      data: {
        totalCost: Math.max(0, agenticSession.totalCost - costDelta),
        inputTokens: Math.max(0, agenticSession.inputTokens - inputTokensDelta),
        outputTokens: Math.max(0, agenticSession.outputTokens - outputTokensDelta),
        cachedTokens: Math.max(0, agenticSession.cachedTokens - cachedTokensDelta),
        messageCount: Math.max(0, agenticSession.messageCount - messagesToDelete.length),
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: messagesToDelete.length,
    })
  } catch (error: any) {
    console.error('Bulk delete messages error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
