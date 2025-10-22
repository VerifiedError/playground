/**
 * API Key Management Routes
 *
 * POST /api/keys - Create a new API key
 * GET /api/keys - List all API keys for the current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey, validatePermissions } from '@/lib/api-key-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/keys
 * Create a new API key
 */
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

    // Parse request body
    const body = await request.json()
    const { name, permissions = ['chat'], rateLimit = 60, expiresAt } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!Array.isArray(permissions) || !validatePermissions(permissions)) {
      return NextResponse.json(
        { error: 'Invalid permissions. Valid: *, chat, sessions, models, files' },
        { status: 400 }
      )
    }

    if (typeof rateLimit !== 'number' || rateLimit < 1 || rateLimit > 1000) {
      return NextResponse.json({ error: 'Rate limit must be between 1 and 1000' }, { status: 400 })
    }

    // Generate API key
    const { key, prefix } = generateApiKey('live')
    const keyHash = hashApiKey(key)

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: name.trim(),
        keyHash,
        keyPrefix: prefix,
        permissions: JSON.stringify(permissions),
        rateLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Return the API key (only shown once!)
    return NextResponse.json({
      id: apiKey.id,
      key, // ⚠️ ONLY returned on creation
      name: apiKey.name,
      prefix: apiKey.keyPrefix,
      permissions: JSON.parse(apiKey.permissions),
      rateLimit: apiKey.rateLimit,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      message: '⚠️ Save this key securely - it will not be shown again!',
    })
  } catch (error: any) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/keys
 * List all API keys for the current user
 */
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

    // Fetch all API keys for this user
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
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

    // Parse permissions JSON
    const formattedKeys = apiKeys.map((key) => ({
      ...key,
      permissions: JSON.parse(key.permissions),
    }))

    return NextResponse.json({
      keys: formattedKeys,
      count: formattedKeys.length,
    })
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
