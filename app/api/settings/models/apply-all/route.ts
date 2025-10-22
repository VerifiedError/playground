import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/settings/models/apply-all - Apply settings to all active models
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { error: 'Missing required field: settings' },
        { status: 400 }
      )
    }

    // Get all active models
    const activeModels = await prisma.groqModel.findMany({
      where: { isActive: true },
      select: { id: true },
    })

    // Create or update settings for all models
    const updatePromises = activeModels.map(async (model) => {
      // Check if settings exist for this model
      const existingSettings = await prisma.modelUserSettings.findUnique({
        where: {
          userId_modelId: {
            userId: session.user.id,
            modelId: model.id,
          },
        },
      })

      if (existingSettings) {
        // Update existing settings
        return prisma.modelUserSettings.update({
          where: { id: existingSettings.id },
          data: {
            // Basic settings
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            topP: settings.topP,
            webSearch: settings.webSearch,
            // Advanced settings
            formattingRules: settings.formattingRules || null,
            systemPromptType: settings.systemPromptType || 'default',
            customSystemPrompt: settings.customSystemPrompt || null,
            chatMemory: settings.chatMemory ?? 10,
            truncationStrategy: settings.truncationStrategy || 'newest',
            // Provider settings
            fileParser: settings.fileParser || 'auto',
            fileParserApiKey: settings.fileParserApiKey || null,
            aiProvider: settings.aiProvider || 'auto',
            aiProviderApiKey: settings.aiProviderApiKey || null,
          },
        })
      } else {
        // Create new settings
        return prisma.modelUserSettings.create({
          data: {
            userId: session.user.id,
            modelId: model.id,
            // Basic settings
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            topP: settings.topP,
            webSearch: settings.webSearch,
            // Advanced settings
            formattingRules: settings.formattingRules || null,
            systemPromptType: settings.systemPromptType || 'default',
            customSystemPrompt: settings.customSystemPrompt || null,
            chatMemory: settings.chatMemory ?? 10,
            truncationStrategy: settings.truncationStrategy || 'newest',
            // Provider settings
            fileParser: settings.fileParser || 'auto',
            fileParserApiKey: settings.fileParserApiKey || null,
            aiProvider: settings.aiProvider || 'auto',
            aiProviderApiKey: settings.aiProviderApiKey || null,
          },
        })
      }
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      modelsUpdated: activeModels.length,
    })
  } catch (error: any) {
    console.error('Apply settings to all models error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
