import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PATCH /api/sessions/[id]/messages/[messageId] - Edit message content
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sessionId, messageId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    // Verify session exists and belongs to user
    const agenticSession = await prisma.agenticSession.findUnique({
      where: { id: sessionId },
    })

    if (!agenticSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (agenticSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update message
    const updatedMessage = await prisma.agenticMessage.update({
      where: { id: messageId },
      data: {
        content,
        // Note: We don't have edited/editedAt in DB schema yet
        // These are tracked in Zustand store only for now
      },
    })

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    })
  } catch (error: any) {
    console.error('Edit message error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions/[id]/messages/[messageId] - Delete single message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sessionId, messageId } = await params

    // Verify session exists and belongs to user
    const agenticSession = await prisma.agenticSession.findUnique({
      where: { id: sessionId },
    })

    if (!agenticSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (agenticSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get message to recalculate session cost
    const message = await prisma.agenticMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Soft delete message (set deletedAt timestamp)
    await prisma.agenticMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    })

    // Update session cost and message count
    await prisma.agenticSession.update({
      where: { id: sessionId },
      data: {
        totalCost: Math.max(0, agenticSession.totalCost - message.cost),
        inputTokens: Math.max(0, agenticSession.inputTokens - message.inputTokens),
        outputTokens: Math.max(0, agenticSession.outputTokens - message.outputTokens),
        cachedTokens: Math.max(0, agenticSession.cachedTokens - message.cachedTokens),
        messageCount: Math.max(0, agenticSession.messageCount - 1),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete message error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
