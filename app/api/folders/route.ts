import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/folders - List all folders for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { sessions: true }, // Count sessions in folder
        },
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({ folders })
  } catch (error: any) {
    console.error('Fetch folders error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/folders - Create new folder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color, icon, description, parentFolderId } = body

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    // If parentFolderId is provided, verify it exists and belongs to user
    if (parentFolderId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentFolderId },
      })

      if (!parentFolder || parentFolder.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        )
      }
    }

    // Get next position number
    const maxPosition = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        parentFolderId: parentFolderId || null,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const folder = await prisma.folder.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        color: color || null,
        icon: icon || null,
        description: description || null,
        parentFolderId: parentFolderId || null,
        position: (maxPosition?.position ?? -1) + 1,
      },
    })

    return NextResponse.json({ folder })
  } catch (error: any) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
