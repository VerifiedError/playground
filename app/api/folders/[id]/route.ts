import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PATCH /api/folders/[id] - Update folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: folderId } = await params
    const body = await request.json()
    const { name, color, icon, description, position } = body

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon
    if (description !== undefined) updateData.description = description
    if (position !== undefined) updateData.position = position

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: updateData,
    })

    return NextResponse.json({ folder: updatedFolder })
  } catch (error: any) {
    console.error('Update folder error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/folders/[id] - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: folderId } = await params

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        sessions: true,
        subFolders: true,
      },
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if folder has sessions or subfolders
    if (folder.sessions.length > 0 || folder.subFolders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with sessions or subfolders' },
        { status: 400 }
      )
    }

    // Delete folder
    await prisma.folder.delete({
      where: { id: folderId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
