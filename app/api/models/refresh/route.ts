import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { groq } from '@/lib/groq'
import { GROQ_PRICING } from '@/lib/groq-utils'
import { getModelMetadata, getModelDisplayName } from '@/lib/model-capability-detector'

// POST /api/models/refresh - Fetch models from Groq API and sync to database
export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Models Refresh] Fetching models from Groq API...')

    // Fetch models from Groq API
    const modelsResponse = await groq.models.list()

    if (!modelsResponse.data || modelsResponse.data.length === 0) {
      throw new Error('No models returned from Groq API')
    }

    console.log(`[Models Refresh] Received ${modelsResponse.data.length} models from Groq`)

    // Parse and upsert each model
    const upsertedModels = []

    for (const model of modelsResponse.data) {
      // Extract model metadata
      const modelId = model.id
      const contextWindow = model.context_window || 8192

      // Get comprehensive metadata using capability detector
      const metadata = getModelMetadata(
        modelId,
        contextWindow,
        model.owned_by,
        model
      )

      // Get display name
      const displayName = getModelDisplayName(modelId)

      // Get pricing from GROQ_PRICING map, default to 0 if not found
      const pricing = GROQ_PRICING[modelId as keyof typeof GROQ_PRICING] || { input: 0, output: 0 }

      // Extract release date from API (created timestamp)
      const releaseDate = model.created ? new Date(model.created * 1000) : null

      // Upsert the model with full metadata
      const upsertedModel = await prisma.groqModel.upsert({
        where: { id: modelId },
        update: {
          displayName,
          owner: metadata.owner,
          modelType: metadata.modelType,
          contextWindow,
          maxInputTokens: metadata.contextLimits?.maxInputTokens,
          maxOutputTokens: metadata.contextLimits?.maxOutputTokens,
          maxImageSize: metadata.contextLimits?.maxImageSize,
          maxImageCount: metadata.contextLimits?.maxImageCount,
          maxAudioDuration: metadata.contextLimits?.maxAudioDuration,
          inputPricing: pricing.input,
          outputPricing: pricing.output,
          supportsTools: metadata.capabilities.supportsTools,
          supportsWebSearch: metadata.capabilities.supportsWebSearch,
          supportsCodeExecution: metadata.capabilities.supportsCodeExecution,
          supportsBrowserAutomation: metadata.capabilities.supportsBrowserAutomation,
          supportsVisitWebsite: metadata.capabilities.supportsVisitWebsite,
          supportsWolframAlpha: metadata.capabilities.supportsWolframAlpha,
          supportsVision: metadata.capabilities.supportsVision,
          supportsReasoning: metadata.capabilities.supportsReasoning,
          supportsAudio: metadata.capabilities.supportsAudio,
          supportsStreaming: metadata.capabilities.supportsStreaming,
          supportsJsonMode: metadata.capabilities.supportsJsonMode,
          supportsPromptCaching: metadata.capabilities.supportsPromptCaching,
          isActive: model.active !== false,
          releaseDate,
          updatedAt: new Date(),
        },
        create: {
          id: modelId,
          displayName,
          owner: metadata.owner,
          modelType: metadata.modelType,
          contextWindow,
          maxInputTokens: metadata.contextLimits?.maxInputTokens,
          maxOutputTokens: metadata.contextLimits?.maxOutputTokens,
          maxImageSize: metadata.contextLimits?.maxImageSize,
          maxImageCount: metadata.contextLimits?.maxImageCount,
          maxAudioDuration: metadata.contextLimits?.maxAudioDuration,
          inputPricing: pricing.input,
          outputPricing: pricing.output,
          supportsTools: metadata.capabilities.supportsTools,
          supportsWebSearch: metadata.capabilities.supportsWebSearch,
          supportsCodeExecution: metadata.capabilities.supportsCodeExecution,
          supportsBrowserAutomation: metadata.capabilities.supportsBrowserAutomation,
          supportsVisitWebsite: metadata.capabilities.supportsVisitWebsite,
          supportsWolframAlpha: metadata.capabilities.supportsWolframAlpha,
          supportsVision: metadata.capabilities.supportsVision,
          supportsReasoning: metadata.capabilities.supportsReasoning,
          supportsAudio: metadata.capabilities.supportsAudio,
          supportsStreaming: metadata.capabilities.supportsStreaming,
          supportsJsonMode: metadata.capabilities.supportsJsonMode,
          supportsPromptCaching: metadata.capabilities.supportsPromptCaching,
          isActive: model.active !== false,
          releaseDate,
        },
      })

      upsertedModels.push(upsertedModel)
      console.log(
        `[Models Refresh] Upserted model: ${modelId} (Type: ${metadata.modelType}, Owner: ${metadata.owner})`
      )
    }

    console.log(`[Models Refresh] Successfully synced ${upsertedModels.length} models`)

    return NextResponse.json({
      success: true,
      count: upsertedModels.length,
      models: upsertedModels,
    })
  } catch (error: any) {
    console.error('[Models Refresh] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to refresh models',
        details: error.message
      },
      { status: 500 }
    )
  }
}
