/**
 * AI Search Messages API
 *
 * Handles adding messages to conversations.
 *
 * POST /api/search/ai/conversations/[id]/messages - Add message to conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/search/ai/conversations/[id]/messages
 *
 * Add a new message to a conversation.
 * Body: {
 *   role: 'user' | 'assistant',
 *   content: string,
 *   searchQuery?: string,
 *   searchType?: string,
 *   searchResults?: object,
 *   cost?: number,
 *   inputTokens?: number,
 *   outputTokens?: number
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

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

    // Verify conversation exists and belongs to user
    const conversation = await prisma.aISearchConversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      role,
      content,
      searchQuery,
      searchType,
      searchResults,
      cost,
      inputTokens,
      outputTokens
    } = body

    // Validate required fields
    if (!role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: role, content' },
        { status: 400 }
      )
    }

    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "assistant"' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.aISearchMessage.create({
      data: {
        conversationId,
        role,
        content,
        searchQuery: searchQuery || null,
        searchType: searchType || null,
        searchResults: searchResults ? JSON.stringify(searchResults) : null,
        cost: cost || null,
        inputTokens: inputTokens || null,
        outputTokens: outputTokens || null
      }
    })

    // Update conversation's updatedAt timestamp
    await prisma.aISearchConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        searchQuery: message.searchQuery,
        searchType: message.searchType,
        searchResults: message.searchResults ? JSON.parse(message.searchResults) : null,
        cost: message.cost,
        inputTokens: message.inputTokens,
        outputTokens: message.outputTokens,
        createdAt: message.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
