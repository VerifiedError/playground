import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/user-preferences/models/bulk
 * Bulk update multiple model preferences for the current user
 * Body: { preferences: Array<{ modelId: string, isEnabled: boolean, isFavorite?: boolean, customLabel?: string }> }
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
    const { preferences } = body

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: 'Preferences must be an array' },
        { status: 400 }
      )
    }

    // Validate all model IDs exist
    const modelIds = preferences.map((p) => p.modelId)
    const models = await prisma.groqModel.findMany({
      where: { id: { in: modelIds } },
      select: { id: true },
    })

    const validModelIds = new Set(models.map((m) => m.id))
    const invalidModelIds = modelIds.filter((id) => !validModelIds.has(id))

    if (invalidModelIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid model IDs: ${invalidModelIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Perform bulk upserts using transaction
    const results = await prisma.$transaction(
      preferences.map((pref) => {
        const updateData: any = {}
        if (pref.isEnabled !== undefined) updateData.isEnabled = pref.isEnabled
        if (pref.isFavorite !== undefined) updateData.isFavorite = pref.isFavorite
        if (pref.customLabel !== undefined) updateData.customLabel = pref.customLabel

        return prisma.userModelPreferences.upsert({
          where: {
            userId_modelId: {
              userId: user.id,
              modelId: pref.modelId,
            },
          },
          update: updateData,
          create: {
            userId: user.id,
            modelId: pref.modelId,
            ...updateData,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      updated: results.length,
      preferences: results,
    })
  } catch (error) {
    console.error('[POST /api/user-preferences/models/bulk] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update model preferences' },
      { status: 500 }
    )
  }
}
