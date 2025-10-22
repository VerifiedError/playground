/**
 * AI Search Conversation Details API
 *
 * Handles individual conversation operations.
 *
 * GET    /api/search/ai/conversations/[id] - Get conversation with messages
 * PATCH  /api/search/ai/conversations/[id] - Update conversation (title)
 * DELETE /api/search/ai/conversations/[id] - Delete conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/search/ai/conversations/[id]
 *
 * Get a specific conversation with all messages.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Fetch conversation with messages
    const conversation = await prisma.aISearchConversation.findFirst({
      where: {
        id,
        userId: user.id // Ensure user owns this conversation
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          searchQuery: msg.searchQuery,
          searchType: msg.searchType,
          searchResults: msg.searchResults ? JSON.parse(msg.searchResults) : null,
          cost: msg.cost,
          inputTokens: msg.inputTokens,
          outputTokens: msg.outputTokens,
          createdAt: msg.createdAt
        }))
      }
    })

  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/search/ai/conversations/[id]
 *
 * Update conversation metadata (currently just title).
 * Body: { title: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    if (typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Invalid title' },
        { status: 400 }
      )
    }

    // Update conversation
    const conversation = await prisma.aISearchConversation.updateMany({
      where: {
        id,
        userId: user.id // Ensure user owns this conversation
      },
      data: {
        title
      }
    })

    if (conversation.count === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Fetch updated conversation
    const updated = await prisma.aISearchConversation.findUnique({
      where: { id }
    })

    return NextResponse.json({
      conversation: {
        id: updated!.id,
        title: updated!.title,
        createdAt: updated!.createdAt,
        updatedAt: updated!.updatedAt
      }
    })

  } catch (error) {
    console.error('Failed to update conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/search/ai/conversations/[id]
 *
 * Delete a conversation and all its messages (cascade).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Delete conversation (messages will be cascade deleted)
    const result = await prisma.aISearchConversation.deleteMany({
      where: {
        id,
        userId: user.id // Ensure user owns this conversation
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
