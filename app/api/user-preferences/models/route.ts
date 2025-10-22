import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/user-preferences/models
 * Fetch all models with user's personal preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all active models
    const models = await prisma.groqModel.findMany({
      where: { isActive: true },
      orderBy: [
        { modelType: 'asc' },
        { displayName: 'asc' },
      ],
    })

    // Fetch user's preferences for these models
    const userPreferences = await prisma.userModelPreferences.findMany({
      where: {
        userId: user.id,
      },
    })

    // Create a map for quick lookup
    const preferencesMap = new Map(
      userPreferences.map((pref) => [pref.modelId, pref])
    )

    // Combine models with user preferences
    const modelsWithPreferences = models.map((model) => {
      const userPref = preferencesMap.get(model.id)
      return {
        ...model,
        userPreferences: {
          isEnabled: userPref?.isEnabled ?? true, // Default to enabled if no preference set
          isFavorite: userPref?.isFavorite ?? false,
          customLabel: userPref?.customLabel ?? null,
        },
      }
    })

    return NextResponse.json({ models: modelsWithPreferences })
  } catch (error) {
    console.error('[GET /api/user-preferences/models] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user-preferences/models
 * Update a single model preference for the current user
 * Body: { modelId: string, isEnabled?: boolean, isFavorite?: boolean, customLabel?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { modelId, isEnabled, isFavorite, customLabel } = body

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    // Verify model exists
    const model = await prisma.groqModel.findUnique({
      where: { id: modelId },
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Upsert user preference (create if doesn't exist, update if exists)
    const updateData: any = {}
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite
    if (customLabel !== undefined) updateData.customLabel = customLabel

    const preference = await prisma.userModelPreferences.upsert({
      where: {
        userId_modelId: {
          userId: user.id,
          modelId,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        modelId,
        ...updateData,
      },
    })

    return NextResponse.json({ success: true, preference })
  } catch (error) {
    console.error('[POST /api/user-preferences/models] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update model preference' },
      { status: 500 }
    )
  }
}
