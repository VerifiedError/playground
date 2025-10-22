import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/sessions/[id]/share - Create or update share link
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
    const { password, expiresIn } = body // expiresIn: '1d' | '1w' | '1m' | 'never'

    // Verify session exists and belongs to user
    const agenticSession = await prisma.agenticSession.findUnique({
      where: { id: sessionId },
      include: { sharedSession: true },
    })

    if (!agenticSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (agenticSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate expiration date
    let expiresAt: Date | null = null
    if (expiresIn && expiresIn !== 'never') {
      const now = new Date()
      if (expiresIn === '1d') {
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
      } else if (expiresIn === '1w') {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      } else if (expiresIn === '1m') {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }

    // Hash password if provided
    let hashedPassword: string | null = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    // Generate unique token (12 chars, URL-safe)
    const token = nanoid(12)

    // Create or update shared session
    const sharedSession = await prisma.sharedSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        userId: session.user.id,
        token,
        password: hashedPassword,
        expiresAt,
        viewCount: 0,
      },
      update: {
        token,
        password: hashedPassword,
        expiresAt,
      },
    })

    // Build share URL
    const baseUrl = request.nextUrl.origin
    const shareUrl = `${baseUrl}/shared/${token}`

    return NextResponse.json({
      success: true,
      shareUrl,
      token,
      expiresAt,
      password: !!password,
    })
  } catch (error: any) {
    console.error('Share generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions/[id]/share - Revoke share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sessionId } = await params

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

    // Delete shared session
    await prisma.sharedSession.delete({
      where: { sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Share revocation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
