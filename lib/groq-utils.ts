// Client-safe Groq utilities (no SDK imports)
// This file can be imported in client components
//
// IMPORTANT: Groq API does NOT provide pricing data.
// This pricing map must be manually maintained from https://groq.com/pricing
// Last updated: January 20, 2025

export const GROQ_PRICING = {
  // === COMPOUND AI SYSTEMS ===
  // Compound models use pass-through pricing (underlying models + tools)
  // Pricing varies based on which models and tools are used
  // Keep at 0 for now - actual costs tracked via underlying model usage
  'groq/compound': {
    input: 0, // Pass-through pricing
    output: 0,
  },
  'groq/compound-mini': {
    input: 0, // Pass-through pricing
    output: 0,
  },

  // === TEXT MODELS ===
  'llama-3.1-8b-instant': {
    input: 0.05,
    output: 0.08,
  },
  'llama-3.3-70b-versatile': {
    input: 0.59,
    output: 0.79,
  },
  'meta-llama/llama-guard-4-12b': {
    input: 0.2,
    output: 0.2,
  },
  'meta-llama/llama-4-maverick-17b-128e-instruct': {
    input: 0.2,
    output: 0.6,
  },
  'meta-llama/llama-4-scout-17b-16e-instruct': {
    input: 0.11,
    output: 0.34,
  },
  'meta-llama/llama-prompt-guard-2-22m': {
    input: 0.03,
    output: 0.03,
  },
  'meta-llama/llama-prompt-guard-2-86m': {
    input: 0.04,
    output: 0.04,
  },
  'moonshotai/kimi-k2-instruct-0905': {
    input: 1.0,
    output: 3.0,
  },
  'qwen/qwen3-32b': {
    input: 0.29,
    output: 0.59,
  },
  'openai/gpt-oss-120b': {
    input: 0.15,
    output: 0.75,
  },
  'openai/gpt-oss-20b': {
    input: 0.1,
    output: 0.5,
  },

  // === AUDIO MODELS ===
  // Note: Whisper models are priced PER HOUR of audio, not per 1M tokens
  // These values are placeholder - actual billing is different
  'whisper-large-v3': {
    input: 0, // $0.111 per hour of audio
    output: 0,
  },
  'whisper-large-v3-turbo': {
    input: 0, // $0.04 per hour of audio
    output: 0,
  },
  // Text-to-Speech models (priced per 1M characters)
  'playai-tts': {
    input: 50.0, // Per 1M characters
    output: 0,
  },
  'playai-tts-arabic': {
    input: 50.0, // Per 1M characters
    output: 0,
  },
} as const

export type GroqModelName = keyof typeof GROQ_PRICING

// Vision-capable models (Llama 4 Scout and Maverick)
const VISION_MODELS = [
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
] as const

export function isGroqModel(model: string): boolean {
  return model.startsWith('groq/') || model in GROQ_PRICING
}

export function isVisionModel(model: string): boolean {
  return VISION_MODELS.includes(model as any)
}

export function calculateGroqCost(
  model: GroqModelName,
  promptTokens: number,
  completionTokens: number
): {
  inputCost: number
  outputCost: number
  totalCost: number
} {
  const pricing = GROQ_PRICING[model]

  if (!pricing) {
    console.warn(`[Groq] Unknown model "${model}". Defaulting cost to 0.`)
    return {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
    }
  }

  const inputCost = (promptTokens / 1_000_000) * pricing.input
  const outputCost = (completionTokens / 1_000_000) * pricing.output
  const totalCost = inputCost + outputCost

  return {
    inputCost,
    outputCost,
    totalCost,
  }
}
