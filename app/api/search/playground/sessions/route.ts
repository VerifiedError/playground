import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/search/playground/sessions - List user's sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const searchType = searchParams.get('searchType') || undefined

    // Build query filters
    const where: any = { userId: user.id }
    if (searchType) {
      where.searchType = searchType
    }

    // Fetch sessions
    const sessions = await prisma.playgroundSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        searchQuery: true,
        searchType: true,
        messageCount: true,
        totalTokens: true,
        estimatedCost: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Get total count
    const totalCount = await prisma.playgroundSession.count({ where })

    return NextResponse.json({
      sessions,
      totalCount,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching playground sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/search/playground/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      searchQuery,
      searchType,
      filters,
      searchResults,
      selectedModel,
    } = body

    // Validate required fields
    if (!searchQuery || !searchType) {
      return NextResponse.json(
        { error: 'searchQuery and searchType are required' },
        { status: 400 }
      )
    }

    // Generate title from search query (truncate to 50 chars)
    const title = searchQuery.length > 50
      ? `${searchQuery.substring(0, 47)}...`
      : searchQuery

    // Create new session
    const playgroundSession = await prisma.playgroundSession.create({
      data: {
        userId: user.id,
        title,
        searchQuery,
        searchType,
        filters: filters ? JSON.stringify(filters) : null,
        searchResults: searchResults ? JSON.stringify(searchResults) : null,
        conversationHistory: JSON.stringify([]),
        selectedModel: selectedModel || 'groq/compound',
        messageCount: 0,
        totalTokens: 0,
        estimatedCost: 0,
      },
    })

    return NextResponse.json(playgroundSession, { status: 201 })
  } catch (error) {
    console.error('Error creating playground session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
