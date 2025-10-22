import Groq from 'groq-sdk'

// Re-export client-safe utilities from groq-utils
export {
  GROQ_PRICING,
  type GroqModelName,
  isGroqModel,
  isVisionModel,
  calculateGroqCost,
} from './groq-utils'

if (!process.env.GROQ_API_KEY) {
  console.warn('[Groq] Missing GROQ_API_KEY environment variable. Groq models will not be available.')
}

// Use official Groq SDK instead of OpenAI SDK
// This properly exposes Groq-specific fields like executed_tools
// NOTE: This groq instance is SERVER-SIDE ONLY
// Lazy initialization to avoid build-time errors
let groqInstance: Groq | null = null

export const groq = new Proxy({} as Groq, {
  get(target, prop) {
    if (!groqInstance) {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY environment variable is not set')
      }
      groqInstance = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      })
    }
    return groqInstance[prop as keyof Groq]
  }
})

/**
 * Create a Groq client with a custom API key (for user-specific keys)
 */
export function createGroqClient(apiKey: string): Groq {
  return new Groq({
    apiKey,
  })
}
