import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/shared/[token] - Fetch shared session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find shared session
    const sharedSession = await prisma.sharedSession.findUnique({
      where: { token },
      include: {
        session: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!sharedSession) {
      return NextResponse.json({ error: 'Shared session not found' }, { status: 404 })
    }

    // Check if expired
    if (sharedSession.expiresAt && new Date() > sharedSession.expiresAt) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 }) // 410 Gone
    }

    // If password protected, require password in header
    if (sharedSession.password) {
      const providedPassword = request.headers.get('x-share-password')

      if (!providedPassword) {
        return NextResponse.json({
          error: 'Password required',
          passwordRequired: true
        }, { status: 401 })
      }

      const isValid = await bcrypt.compare(providedPassword, sharedSession.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
    }

    // Increment view count
    await prisma.sharedSession.update({
      where: { id: sharedSession.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    })

    // Return session data (without user info)
    return NextResponse.json({
      session: {
        id: sharedSession.session.id,
        title: sharedSession.session.title,
        model: sharedSession.session.model,
        totalCost: sharedSession.session.totalCost,
        messageCount: sharedSession.session.messageCount,
        createdAt: sharedSession.session.createdAt,
        updatedAt: sharedSession.session.updatedAt,
        messages: sharedSession.session.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          reasoning: msg.reasoning,
          attachments: msg.attachments,
          toolCalls: msg.toolCalls,
          createdAt: msg.createdAt,
          cost: msg.cost,
          inputTokens: msg.inputTokens,
          outputTokens: msg.outputTokens,
          cachedTokens: msg.cachedTokens,
        })),
      },
      sharedInfo: {
        viewCount: sharedSession.viewCount + 1, // Include current view
        createdAt: sharedSession.createdAt,
        expiresAt: sharedSession.expiresAt,
      },
    })
  } catch (error: any) {
    console.error('Shared session fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
