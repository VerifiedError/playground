// Model Categorization System
// Organizes models into logical categories for discovery

import { ModelType } from './model-capability-detector'

export interface ModelCategory {
  id: string
  name: string
  icon: string
  description: string
  priority: number // Lower = shown first
}

/**
 * Model category definitions
 */
export const MODEL_CATEGORIES: Record<string, ModelCategory> = {
  recommended: {
    id: 'recommended',
    name: 'Recommended',
    icon: '⭐',
    description: 'Top models for most tasks',
    priority: 0,
  },
  compound: {
    id: 'compound',
    name: 'Compound (AI Systems)',
    icon: '⚡',
    description: 'Built-in tools: web search, code execution, browser automation',
    priority: 1,
  },
  vision: {
    id: 'vision',
    name: 'Vision',
    icon: '👁️',
    description: 'Image understanding and analysis',
    priority: 2,
  },
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning',
    icon: '🧠',
    description: 'Shows step-by-step thinking process',
    priority: 3,
  },
  chat: {
    id: 'chat',
    name: 'Chat',
    icon: '💬',
    description: 'General-purpose conversation',
    priority: 4,
  },
  audio: {
    id: 'audio',
    name: 'Audio',
    icon: '🎵',
    description: 'Speech-to-text and text-to-speech',
    priority: 5,
  },
  specialized: {
    id: 'specialized',
    name: 'Specialized',
    icon: '🛡️',
    description: 'Safety, security, and specialized tasks',
    priority: 6,
  },
}

/**
 * Recommended model IDs (manually curated)
 */
export const RECOMMENDED_MODELS = [
  'groq/compound', // Best for complex tasks with tools
  'llama-3.3-70b-versatile', // Best general chat
  'llama-4-scout-17b-16e-instruct', // Best vision + speed
  'deepseek-r1-distill-llama-70b', // Best reasoning (free)
]

/**
 * Get category for a model type
 */
export function getCategory(modelType: ModelType): string {
  const categoryMap: Record<ModelType, string> = {
    compound: 'compound',
    vision: 'vision',
    reasoning: 'reasoning',
    'audio-stt': 'audio',
    'audio-tts': 'audio',
    guard: 'specialized',
    chat: 'chat',
  }
  return categoryMap[modelType] || 'chat'
}

/**
 * Check if a model should be in the recommended category
 */
export function isRecommendedModel(modelId: string): boolean {
  return RECOMMENDED_MODELS.some(
    (id) => modelId === id || modelId.includes(id.replace('meta-llama/', ''))
  )
}

/**
 * Get all categories a model belongs to
 */
export function getModelCategories(modelId: string, modelType: ModelType): string[] {
  const categories: string[] = []

  // Recommended category
  if (isRecommendedModel(modelId)) {
    categories.push('recommended')
  }

  // Primary category based on type
  categories.push(getCategory(modelType))

  return categories
}

/**
 * Sort categories by priority
 */
export function sortCategories(categoryIds: string[]): string[] {
  return categoryIds.sort((a, b) => {
    const priorityA = MODEL_CATEGORIES[a]?.priority ?? 999
    const priorityB = MODEL_CATEGORIES[b]?.priority ?? 999
    return priorityA - priorityB
  })
}

/**
 * Get capability badges for a model
 */
export interface CapabilityBadge {
  label: string
  tooltip: string
  variant: 'default' | 'success' | 'info' | 'warning'
}

export function getCapabilityBadges(capabilities: {
  supportsTools?: boolean
  supportsWebSearch?: boolean
  supportsCodeExecution?: boolean
  supportsVision?: boolean
  supportsReasoning?: boolean
  supportsAudio?: boolean
}): CapabilityBadge[] {
  const badges: CapabilityBadge[] = []

  if (capabilities.supportsWebSearch) {
    badges.push({
      label: 'Web Search',
      tooltip: 'Can search the web for real-time information',
      variant: 'info',
    })
  }

  if (capabilities.supportsCodeExecution) {
    badges.push({
      label: 'Code',
      tooltip: 'Can execute Python code',
      variant: 'success',
    })
  }

  if (capabilities.supportsVision) {
    badges.push({
      label: 'Vision',
      tooltip: 'Can analyze images',
      variant: 'info',
    })
  }

  if (capabilities.supportsTools && !capabilities.supportsWebSearch) {
    // Only show if not already showing web search (which implies tools)
    badges.push({
      label: 'Tools',
      tooltip: 'Supports function calling',
      variant: 'default',
    })
  }

  if (capabilities.supportsReasoning) {
    badges.push({
      label: 'Reasoning',
      tooltip: 'Shows thinking process',
      variant: 'warning',
    })
  }

  if (capabilities.supportsAudio) {
    badges.push({
      label: 'Audio',
      tooltip: 'Speech processing',
      variant: 'info',
    })
  }

  return badges
}

/**
 * Format pricing for display
 */
export function formatPricing(input: number, output: number): string {
  // Free models
  if (input === 0 && output === 0) {
    return 'Free'
  }

  // Same price for input/output
  if (input === output) {
    return `$${input.toFixed(2)}/1M`
  }

  // Different prices
  return `$${input.toFixed(2)}/$${output.toFixed(2)}/1M`
}

/**
 * Format context window for display
 */
export function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M tokens`
  }
  if (tokens >= 1_000) {
    return `${Math.floor(tokens / 1_000)}K tokens`
  }
  return `${tokens} tokens`
}

/**
 * Get a short description for a model based on its capabilities
 */
export function getModelShortDescription(modelId: string, capabilities: any): string {
  const parts: string[] = []

  // Compound models
  if (capabilities.supportsWebSearch && capabilities.supportsCodeExecution) {
    return 'AI system with web search, code execution, and browser automation'
  }

  // Vision models
  if (capabilities.supportsVision) {
    if (capabilities.supportsTools) {
      parts.push('Vision + tools')
    } else {
      parts.push('Image understanding')
    }
  }

  // Reasoning models
  if (capabilities.supportsReasoning) {
    parts.push('Step-by-step reasoning')
  }

  // Audio models
  if (capabilities.supportsAudio) {
    if (modelId.includes('whisper')) {
      parts.push('Speech-to-text')
    } else if (modelId.includes('tts')) {
      parts.push('Text-to-speech')
    }
  }

  // Guard models
  if (modelId.includes('guard')) {
    parts.push('Safety & moderation')
  }

  // General chat
  if (parts.length === 0) {
    if (capabilities.supportsTools) {
      parts.push('Chat with function calling')
    } else {
      parts.push('General conversation')
    }
  }

  return parts.join(' • ')
}

/**
 * Model comparison helpers
 */
export interface ModelComparison {
  modelId: string
  displayName: string
  pros: string[]
  cons: string[]
}

export function getModelAlternatives(modelId: string): string[] {
  // Compound alternatives
  if (modelId === 'groq/compound') {
    return ['groq/compound-mini']
  }
  if (modelId === 'groq/compound-mini') {
    return ['groq/compound']
  }

  // Vision alternatives
  if (modelId.includes('llama-4-scout')) {
    return ['meta-llama/llama-4-maverick-17b-128e-instruct', 'llama-3.2-11b-vision-preview']
  }
  if (modelId.includes('llama-4-maverick')) {
    return ['meta-llama/llama-4-scout-17b-16e-instruct', 'llama-3.2-90b-vision-preview']
  }

  // Reasoning alternatives
  if (modelId.includes('deepseek-r1')) {
    return ['openai/gpt-oss-120b', 'qwen-qwq-32b']
  }

  // Chat alternatives
  if (modelId === 'llama-3.3-70b-versatile') {
    return ['llama-3.1-8b-instant', 'qwen-2.5-32b']
  }

  return []
}

/**
 * Get recommendation reason for a model
 */
export function getRecommendationReason(modelId: string): string {
  const reasons: Record<string, string> = {
    'groq/compound': 'Most capable - includes web search, code execution, and all tools',
    'llama-3.3-70b-versatile': 'Best general-purpose chat model with large context window',
    'meta-llama/llama-4-scout-17b-16e-instruct': 'Fast vision model with tool support',
    'deepseek-r1-distill-llama-70b': 'Shows reasoning process, free during preview',
  }

  for (const [key, reason] of Object.entries(reasons)) {
    if (modelId.includes(key)) {
      return reason
    }
  }

  return ''
}
