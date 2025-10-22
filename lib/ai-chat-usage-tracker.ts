/**
 * AI Chat Usage Tracker
 *
 * Tracks usage statistics for the AI chat feature:
 * - Messages sent/received
 * - Tokens used (input/output)
 * - Estimated cost
 * - Model usage
 */

export interface UsageStats {
  totalMessages: number
  userMessages: number
  aiMessages: number
  totalTokens: number
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  modelsUsed: Record<string, number> // model -> message count
  lastUpdated: string
}

export interface MessageUsage {
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
}

/**
 * Groq model pricing (per 1M tokens)
 */
const GROQ_PRICING: Record<string, { input: number; output: number }> = {
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.2-1b-preview': { input: 0.04, output: 0.04 },
  'llama-3.2-3b-preview': { input: 0.06, output: 0.06 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  'gemma2-9b-it': { input: 0.20, output: 0.20 },
  'gemma-7b-it': { input: 0.07, output: 0.07 },
}

/**
 * LocalStorage key for usage stats
 */
const USAGE_STATS_KEY = 'ai-chat-usage-stats'

/**
 * Calculate token count (rough estimation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Calculate cost for a message
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = GROQ_PRICING[model] || { input: 0.59, output: 0.79 }

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}

/**
 * Load usage stats from localStorage
 */
export function loadUsageStats(): UsageStats {
  if (typeof window === 'undefined') {
    return getDefaultStats()
  }

  try {
    const stored = localStorage.getItem(USAGE_STATS_KEY)
    if (!stored) return getDefaultStats()

    const stats = JSON.parse(stored)
    return {
      ...getDefaultStats(),
      ...stats,
    }
  } catch (error) {
    console.error('Failed to load usage stats:', error)
    return getDefaultStats()
  }
}

/**
 * Save usage stats to localStorage
 */
export function saveUsageStats(stats: UsageStats): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(USAGE_STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('Failed to save usage stats:', error)
  }
}

/**
 * Get default/empty stats
 */
function getDefaultStats(): UsageStats {
  return {
    totalMessages: 0,
    userMessages: 0,
    aiMessages: 0,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
    modelsUsed: {},
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Record a user message
 */
export function recordUserMessage(message: string): void {
  const stats = loadUsageStats()
  const tokens = estimateTokens(message)

  stats.totalMessages += 1
  stats.userMessages += 1
  stats.inputTokens += tokens
  stats.totalTokens += tokens
  stats.lastUpdated = new Date().toISOString()

  saveUsageStats(stats)
}

/**
 * Record an AI message
 */
export function recordAIMessage(message: string, model: string): MessageUsage {
  const stats = loadUsageStats()
  const outputTokens = estimateTokens(message)

  // Use average input tokens (context window)
  const inputTokens = Math.floor(stats.inputTokens / Math.max(stats.userMessages, 1))

  const cost = calculateCost(model, inputTokens, outputTokens)

  stats.totalMessages += 1
  stats.aiMessages += 1
  stats.outputTokens += outputTokens
  stats.totalTokens += outputTokens
  stats.estimatedCost += cost
  stats.modelsUsed[model] = (stats.modelsUsed[model] || 0) + 1
  stats.lastUpdated = new Date().toISOString()

  saveUsageStats(stats)

  return {
    model,
    inputTokens,
    outputTokens,
    cost,
  }
}

/**
 * Reset usage stats
 */
export function resetUsageStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USAGE_STATS_KEY)
}

/**
 * Format cost as USD
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return '<$0.01'
  }
  return `$${cost.toFixed(3)}`
}

/**
 * Format token count with commas
 */
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString('en-US')
}

/**
 * Get usage summary
 */
export function getUsageSummary(): {
  messages: string
  tokens: string
  cost: string
  topModel: string | null
} {
  const stats = loadUsageStats()

  const topModel = Object.entries(stats.modelsUsed)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return {
    messages: `${stats.totalMessages} (${stats.userMessages} sent, ${stats.aiMessages} received)`,
    tokens: formatTokens(stats.totalTokens),
    cost: formatCost(stats.estimatedCost),
    topModel,
  }
}
