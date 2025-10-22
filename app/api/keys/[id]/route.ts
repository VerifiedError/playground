/**
 * Individual API Key Management Routes
 *
 * GET /api/keys/[id] - Get details of a specific API key
 * PATCH /api/keys/[id] - Update API key (toggle active status, update name, etc.)
 * DELETE /api/keys/[id] - Delete an API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validatePermissions } from '@/lib/api-key-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/keys/[id]
 * Get details of a specific API key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Fetch API key
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        rateLimit: true,
        totalRequests: true,
        lastUsedAt: true,
        lastUsedIp: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Ensure the API key belongs to the user
    if (apiKey.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse permissions JSON
    return NextResponse.json({
      ...apiKey,
      permissions: JSON.parse(apiKey.permissions),
    })
  } catch (error: any) {
    console.error('Error fetching API key:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/keys/[id]
 * Update API key (toggle active status, update name, permissions, rate limit)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Fetch API key to verify ownership
    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
    })

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    if (existingKey.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name, permissions, rateLimit, isActive, expiresAt } = body

    // Validate inputs
    const updateData: any = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions) || !validatePermissions(permissions)) {
        return NextResponse.json(
          { error: 'Invalid permissions. Valid: *, chat, sessions, models, files' },
          { status: 400 }
        )
      }
      updateData.permissions = JSON.stringify(permissions)
    }

    if (rateLimit !== undefined) {
      if (typeof rateLimit !== 'number' || rateLimit < 1 || rateLimit > 1000) {
        return NextResponse.json({ error: 'Rate limit must be between 1 and 1000' }, { status: 400 })
      }
      updateData.rateLimit = rateLimit
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
      }
      updateData.isActive = isActive
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    }

    // Update API key
    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        rateLimit: true,
        totalRequests: true,
        lastUsedAt: true,
        lastUsedIp: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      ...updatedKey,
      permissions: JSON.parse(updatedKey.permissions),
    })
  } catch (error: any) {
    console.error('Error updating API key:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/keys/[id]
 * Delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Fetch API key to verify ownership
    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
    })

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    if (existingKey.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete API key
    await prisma.apiKey.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
