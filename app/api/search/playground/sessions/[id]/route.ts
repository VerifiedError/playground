import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/search/playground/sessions/[id] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    // Fetch session
    const playgroundSession = await prisma.playgroundSession.findUnique({
      where: { id },
    })

    if (!playgroundSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify ownership
    if (playgroundSession.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse JSON fields
    const result = {
      ...playgroundSession,
      filters: playgroundSession.filters
        ? JSON.parse(playgroundSession.filters)
        : null,
      searchResults: playgroundSession.searchResults
        ? JSON.parse(playgroundSession.searchResults)
        : null,
      conversationHistory: playgroundSession.conversationHistory
        ? JSON.parse(playgroundSession.conversationHistory)
        : [],
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching playground session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/search/playground/sessions/[id] - Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    // Check if session exists and user owns it
    const existingSession = await prisma.playgroundSession.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (existingSession.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      conversationHistory,
      selectedModel,
      messageCount,
      totalTokens,
      estimatedCost,
      searchResults,
      filters,
    } = body

    // Build update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (conversationHistory !== undefined)
      updateData.conversationHistory = JSON.stringify(conversationHistory)
    if (selectedModel !== undefined) updateData.selectedModel = selectedModel
    if (messageCount !== undefined) updateData.messageCount = messageCount
    if (totalTokens !== undefined) updateData.totalTokens = totalTokens
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost
    if (searchResults !== undefined)
      updateData.searchResults = JSON.stringify(searchResults)
    if (filters !== undefined) updateData.filters = JSON.stringify(filters)

    // Update session
    const updatedSession = await prisma.playgroundSession.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error updating playground session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/search/playground/sessions/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    // Check if session exists and user owns it
    const existingSession = await prisma.playgroundSession.findUnique({
      where: { id },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (existingSession.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete session
    await prisma.playgroundSession.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playground session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
