import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/sessions/[id]
 * Delete a session (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const { id } = await params

    // Validate session ID format (UUID)
    if (!id || typeof id !== 'string' || id.length === 0) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      )
    }

    // Check if session exists
    const existingSession = await prisma.agenticSession.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Delete session (cascade deletes messages)
    await prisma.agenticSession.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Session deleted successfully',
      deletedSessionId: id,
      sessionName: existingSession.name,
    })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
