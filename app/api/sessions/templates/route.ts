import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/sessions/templates - List all session templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includePublic = searchParams.get('includePublic') === 'true'

    // Build where clause
    const where: any = {
      isTemplate: true,
    }

    if (includePublic) {
      // Include user's templates and public templates (if we add that later)
      where.userId = session.user.id
    } else {
      // Only user's templates
      where.userId = session.user.id
    }

    const templates = await prisma.agenticSession.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 5, // Preview first 5 messages
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error('Fetch templates error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/sessions/templates - Create session from template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Fetch template
    const template = await prisma.agenticSession.findUnique({
      where: {
        id: templateId,
        isTemplate: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Verify access (user's template)
    if (template.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Create new session from template
    const newSession = await prisma.agenticSession.create({
      data: {
        userId: session.user.id,
        title: template.title,
        model: template.model,
        settings: template.settings,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        messageCount: template.messages.length,
        // Don't copy template status
        isTemplate: false,
        // Copy organization fields
        folderId: template.folderId,
        tags: template.tags,
        isStarred: false,
        isArchived: false,
      },
    })

    // Copy messages from template
    if (template.messages.length > 0) {
      await prisma.agenticMessage.createMany({
        data: template.messages.map((msg) => ({
          sessionId: newSession.id,
          role: msg.role,
          content: msg.content,
          cost: 0, // Templates don't carry over cost
          inputTokens: 0,
          outputTokens: 0,
          cachedTokens: 0,
          toolCalls: msg.toolCalls,
          attachments: msg.attachments,
          reasoning: msg.reasoning,
        })),
      })
    }

    // Fetch complete session with messages
    const completeSession = await prisma.agenticSession.findUnique({
      where: { id: newSession.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      session: completeSession,
    })
  } catch (error: any) {
    console.error('Create from template error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
