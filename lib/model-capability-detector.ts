// Model Capability Detection System
// Intelligently detects model capabilities based on patterns and API data

export type ModelType = 'compound' | 'vision' | 'reasoning' | 'audio-stt' | 'audio-tts' | 'guard' | 'chat'

export interface ModelCapabilities {
  // Core capabilities
  supportsTools: boolean
  supportsWebSearch: boolean
  supportsCodeExecution: boolean
  supportsBrowserAutomation: boolean
  supportsVisitWebsite: boolean
  supportsWolframAlpha: boolean
  supportsVision: boolean
  supportsReasoning: boolean
  supportsAudio: boolean
  supportsStreaming: boolean
  supportsJsonMode: boolean
  supportsPromptCaching: boolean
}

export interface ModelMetadata {
  owner: string
  modelType: ModelType
  capabilities: ModelCapabilities
  contextLimits?: {
    maxInputTokens?: number
    maxOutputTokens?: number
    maxImageSize?: number // MB
    maxImageCount?: number
    maxAudioDuration?: number // seconds
  }
}

/**
 * Pattern-based capability detection
 */
const CAPABILITY_PATTERNS = {
  // Compound models (AI systems with built-in tools)
  compound: /^groq\/compound/i,

  // Vision models (image understanding)
  vision: /vision|llava|llama-4-(scout|maverick)|llama-3\.2-(11b|90b)/i,

  // Reasoning models (expose thinking process)
  reasoning: /deepseek-r1|gpt-oss|qwen.*qwq/i,

  // Audio models
  audioSTT: /whisper/i,
  audioTTS: /playai-tts/i,

  // Guard models (safety/filtering)
  guard: /llama-guard|prompt-guard/i,

  // Models that support tools (function calling)
  tools: /llama-4-(scout|maverick)|llama-3\.(3|1)|qwen|gpt-oss|gemma2/i,
}

/**
 * Detect owner from model ID or owned_by field
 */
export function detectModelOwner(modelId: string, ownedBy?: string): string {
  if (ownedBy) {
    return ownedBy
  }

  // Extract owner from model ID prefix
  if (modelId.startsWith('meta-llama/')) return 'Meta'
  if (modelId.startsWith('groq/')) return 'Groq'
  if (modelId.startsWith('openai/')) return 'OpenAI'
  if (modelId.startsWith('qwen/')) return 'Alibaba Cloud'
  if (modelId.startsWith('moonshotai/')) return 'Moonshot AI'
  if (modelId.startsWith('playai')) return 'PlayAI'
  if (modelId.startsWith('mistral')) return 'Mistral AI'
  if (modelId.startsWith('gemma')) return 'Google'

  // Check if model ID contains owner name
  if (modelId.includes('llama')) return 'Meta'
  if (modelId.includes('qwen')) return 'Alibaba Cloud'
  if (modelId.includes('deepseek')) return 'DeepSeek'
  if (modelId.includes('whisper')) return 'OpenAI'

  return 'Unknown'
}

/**
 * Detect model type from model ID
 */
export function detectModelType(modelId: string): ModelType {
  // Compound models (highest priority)
  if (CAPABILITY_PATTERNS.compound.test(modelId)) {
    return 'compound'
  }

  // Audio models
  if (CAPABILITY_PATTERNS.audioSTT.test(modelId)) {
    return 'audio-stt'
  }
  if (CAPABILITY_PATTERNS.audioTTS.test(modelId)) {
    return 'audio-tts'
  }

  // Guard models
  if (CAPABILITY_PATTERNS.guard.test(modelId)) {
    return 'guard'
  }

  // Reasoning models
  if (CAPABILITY_PATTERNS.reasoning.test(modelId)) {
    return 'reasoning'
  }

  // Vision models
  if (CAPABILITY_PATTERNS.vision.test(modelId)) {
    return 'vision'
  }

  // Default: chat model
  return 'chat'
}

/**
 * Detect all capabilities for a model
 */
export function detectModelCapabilities(modelId: string, apiData?: any): ModelCapabilities {
  const modelType = detectModelType(modelId)

  // Start with conservative defaults
  const capabilities: ModelCapabilities = {
    supportsTools: false,
    supportsWebSearch: false,
    supportsCodeExecution: false,
    supportsBrowserAutomation: false,
    supportsVisitWebsite: false,
    supportsWolframAlpha: false,
    supportsVision: false,
    supportsReasoning: false,
    supportsAudio: false,
    supportsStreaming: true, // Most models support streaming
    supportsJsonMode: false,
    supportsPromptCaching: false,
  }

  // Compound models: ALL built-in tools
  if (modelType === 'compound') {
    capabilities.supportsTools = true
    capabilities.supportsWebSearch = true
    capabilities.supportsCodeExecution = true
    capabilities.supportsBrowserAutomation = true
    capabilities.supportsVisitWebsite = true
    capabilities.supportsWolframAlpha = true
    capabilities.supportsJsonMode = true
    return capabilities
  }

  // Vision models
  if (modelType === 'vision') {
    capabilities.supportsVision = true
    capabilities.supportsJsonMode = true

    // Llama 4 vision models also support tools
    if (/llama-4-(scout|maverick)/.test(modelId)) {
      capabilities.supportsTools = true
    }

    return capabilities
  }

  // Reasoning models
  if (modelType === 'reasoning') {
    capabilities.supportsReasoning = true
    capabilities.supportsTools = true // Most reasoning models support tools
    capabilities.supportsJsonMode = true
    return capabilities
  }

  // Audio models
  if (modelType === 'audio-stt' || modelType === 'audio-tts') {
    capabilities.supportsAudio = true
    capabilities.supportsStreaming = (modelType === 'audio-stt') // STT typically streams, TTS may not
    return capabilities
  }

  // Guard models (safety/filtering)
  if (modelType === 'guard') {
    capabilities.supportsJsonMode = true
    return capabilities
  }

  // Chat models: Check if they support tools
  if (CAPABILITY_PATTERNS.tools.test(modelId)) {
    capabilities.supportsTools = true
    capabilities.supportsJsonMode = true
  }

  // Modern models with large context typically support JSON mode
  if (apiData?.context_window && apiData.context_window >= 8192) {
    capabilities.supportsJsonMode = true
  }

  return capabilities
}

/**
 * Detect context limits for a model
 */
export function detectContextLimits(modelId: string, contextWindow: number): {
  maxInputTokens?: number
  maxOutputTokens?: number
  maxImageSize?: number
  maxImageCount?: number
  maxAudioDuration?: number
} {
  const modelType = detectModelType(modelId)
  const limits: any = {}

  // Input tokens (typically 90% of context window)
  limits.maxInputTokens = Math.floor(contextWindow * 0.9)

  // Output tokens (varies by model)
  if (modelType === 'compound') {
    limits.maxOutputTokens = 8000 // Compound models typically cap at 8k output
  } else if (contextWindow >= 100000) {
    limits.maxOutputTokens = 8000 // Large context models usually cap output
  } else {
    limits.maxOutputTokens = Math.floor(contextWindow * 0.25) // 25% for smaller models
  }

  // Vision model limits
  if (modelType === 'vision') {
    limits.maxImageSize = 20 // MB (Groq API limit)
    limits.maxImageCount = 5 // Typical limit
  }

  // Audio model limits
  if (modelType === 'audio-stt') {
    limits.maxAudioDuration = 3600 // 1 hour (typical STT limit)
  }

  return limits
}

/**
 * Get comprehensive model metadata
 */
export function getModelMetadata(
  modelId: string,
  contextWindow: number,
  ownedBy?: string,
  apiData?: any
): ModelMetadata {
  return {
    owner: detectModelOwner(modelId, ownedBy),
    modelType: detectModelType(modelId),
    capabilities: detectModelCapabilities(modelId, apiData),
    contextLimits: detectContextLimits(modelId, contextWindow),
  }
}

/**
 * Get a user-friendly display name for a model
 */
export function getModelDisplayName(modelId: string): string {
  return modelId
    .replace(/^(groq|meta-llama|openai|qwen|moonshotai|playai)\//gi, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Get an emoji icon for a model type
 */
export function getModelTypeIcon(modelType: ModelType): string {
  const icons: Record<ModelType, string> = {
    compound: '⚡',
    vision: '👁️',
    reasoning: '🧠',
    'audio-stt': '🎙️',
    'audio-tts': '🔊',
    guard: '🛡️',
    chat: '💬',
  }
  return icons[modelType] || '💬'
}

/**
 * Get a description for a model type
 */
export function getModelTypeDescription(modelType: ModelType): string {
  const descriptions: Record<ModelType, string> = {
    compound: 'AI System with built-in tools (web search, code execution, browser automation)',
    vision: 'Multimodal model with image understanding',
    reasoning: 'Shows step-by-step thinking process',
    'audio-stt': 'Speech-to-text transcription',
    'audio-tts': 'Text-to-speech generation',
    guard: 'Safety and content moderation',
    chat: 'General-purpose conversation',
  }
  return descriptions[modelType] || 'General-purpose AI model'
}
