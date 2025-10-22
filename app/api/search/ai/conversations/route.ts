/**
 * AI Search Conversations API
 *
 * Handles conversation CRUD operations for AI search feature.
 *
 * GET  /api/search/ai/conversations - List user's conversations
 * POST /api/search/ai/conversations - Create new conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/search/ai/conversations
 *
 * List all conversations for the authenticated user.
 * Returns conversations ordered by most recent first.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch conversations with message counts
    const conversations = await prisma.aISearchConversation.findMany({
      where: {
        userId: user.id
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await prisma.aISearchConversation.count({
      where: {
        userId: user.id
      }
    })

    return NextResponse.json({
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messageCount: conv._count.messages,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + conversations.length < totalCount
      }
    })

  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/search/ai/conversations
 *
 * Create a new conversation.
 * Body: { title?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title } = body

    // Create conversation
    const conversation = await prisma.aISearchConversation.create({
      data: {
        userId: user.id,
        title: title || null
      }
    })

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
