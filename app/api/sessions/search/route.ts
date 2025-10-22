import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/sessions/search - Search across all sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const role = searchParams.get('role') // Filter by role (user/assistant/system)
    const model = searchParams.get('model') // Filter by model
    const minCost = searchParams.get('minCost') // Min cost filter
    const maxCost = searchParams.get('maxCost') // Max cost filter
    const hasImages = searchParams.get('hasImages') === 'true' // Has attachments
    const hasReasoning = searchParams.get('hasReasoning') === 'true' // Has reasoning
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    // Build where clause for messages
    const messageWhere: any = {
      session: {
        userId: session.user.id,
      },
      content: {
        contains: query,
        mode: 'insensitive',
      },
    }

    // Add optional filters
    if (role) {
      messageWhere.role = role
    }

    if (minCost !== null && minCost !== undefined) {
      messageWhere.cost = {
        ...messageWhere.cost,
        gte: parseFloat(minCost),
      }
    }

    if (maxCost !== null && maxCost !== undefined) {
      messageWhere.cost = {
        ...messageWhere.cost,
        lte: parseFloat(maxCost),
      }
    }

    if (hasImages) {
      messageWhere.attachments = {
        not: null,
      }
    }

    if (hasReasoning) {
      messageWhere.reasoning = {
        not: null,
      }
    }

    // Search messages
    const messages = await prisma.agenticMessage.findMany({
      where: messageWhere,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            model: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Filter by model if specified (at session level)
    let filteredMessages = messages
    if (model) {
      filteredMessages = messages.filter((msg) => msg.session.model === model)
    }

    // Format results with context
    const results = filteredMessages.map((msg) => {
      // Highlight search query in content
      const contentLower = msg.content.toLowerCase()
      const queryLower = query.toLowerCase()
      const queryIndex = contentLower.indexOf(queryLower)

      let snippet = msg.content
      let highlightStart = 0
      let highlightEnd = 0

      if (queryIndex !== -1) {
        // Extract context around match (100 chars before and after)
        const start = Math.max(0, queryIndex - 100)
        const end = Math.min(msg.content.length, queryIndex + query.length + 100)

        snippet = (start > 0 ? '...' : '') +
                  msg.content.substring(start, end) +
                  (end < msg.content.length ? '...' : '')

        highlightStart = queryIndex - start + (start > 0 ? 3 : 0)
        highlightEnd = highlightStart + query.length
      }

      return {
        messageId: msg.id,
        sessionId: msg.session.id,
        sessionTitle: msg.session.title,
        sessionModel: msg.session.model,
        role: msg.role,
        content: snippet,
        fullContent: msg.content,
        highlightStart,
        highlightEnd,
        cost: msg.cost,
        inputTokens: msg.inputTokens,
        outputTokens: msg.outputTokens,
        hasAttachments: !!msg.attachments,
        hasReasoning: !!msg.reasoning,
        createdAt: msg.createdAt,
      }
    })

    return NextResponse.json({
      results,
      count: results.length,
      query,
      filters: {
        role,
        model,
        minCost,
        maxCost,
        hasImages,
        hasReasoning,
      },
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
