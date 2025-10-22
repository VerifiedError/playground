import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions} from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/settings/models
 * Fetch all model settings for the authenticated user
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

    // Fetch all model settings for this user
    const settings = await prisma.modelUserSettings.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      settings,
      count: settings.length,
    })
  } catch (error) {
    console.error('Failed to fetch model settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model settings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings/models
 * Create or update model settings for a specific model
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

    const body = await request.json()
    const {
      modelId,
      enabled,
      customLabel,
      fileParser,
      fileParserApiKey,
      aiProvider,
      aiProviderApiKey,
      formattingRules,
      systemPromptType,
      customSystemPrompt,
      chatMemory,
      temperature,
      maxTokens,
      topP,
      webSearch,
    } = body

    if (!modelId) {
      return NextResponse.json({ error: 'modelId is required' }, { status: 400 })
    }

    // Upsert model settings
    const settings = await prisma.modelUserSettings.upsert({
      where: {
        userId_modelId: {
          userId: user.id,
          modelId,
        },
      },
      update: {
        enabled,
        customLabel,
        fileParser,
        fileParserApiKey,
        aiProvider,
        aiProviderApiKey,
        formattingRules,
        systemPromptType,
        customSystemPrompt,
        chatMemory,
        temperature,
        maxTokens,
        topP,
        webSearch,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        modelId,
        enabled: enabled ?? true,
        customLabel,
        fileParser,
        fileParserApiKey,
        aiProvider,
        aiProviderApiKey,
        formattingRules,
        systemPromptType,
        customSystemPrompt,
        chatMemory,
        temperature,
        maxTokens,
        topP,
        webSearch,
      },
    })

    return NextResponse.json({
      settings,
      message: 'Model settings saved successfully',
    })
  } catch (error) {
    console.error('Failed to save model settings:', error)
    return NextResponse.json(
      { error: 'Failed to save model settings' },
      { status: 500 }
    )
  }
}
