/**
 * Token Counter Utility
 *
 * Provides approximate token counting for text content.
 * Uses a simple heuristic: ~4 characters per token (average for GPT models).
 *
 * For more accurate counting, consider using tiktoken library in the future.
 */

/**
 * Estimate token count for a given text
 * @param text - The text to count tokens for
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) return 0

  // Simple heuristic: ~4 characters per token
  // This is a rough approximation and varies by model and content type
  const charCount = text.length
  return Math.ceil(charCount / 4)
}

/**
 * Estimate token count for multiple messages
 * @param messages - Array of message objects with content
 * @returns Approximate total token count
 */
export function estimateMessagesTokenCount(
  messages: Array<{ content: string; role?: string }>
): number {
  if (!messages || messages.length === 0) return 0

  let totalTokens = 0

  for (const message of messages) {
    // Add tokens for message content
    totalTokens += estimateTokenCount(message.content)

    // Add overhead for message structure (~4 tokens per message)
    // This accounts for role, formatting, etc.
    totalTokens += 4
  }

  return totalTokens
}

/**
 * Estimate cost for token usage
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param inputPricing - Cost per 1M input tokens
 * @param outputPricing - Cost per 1M output tokens
 * @returns Estimated cost in dollars
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  inputPricing: number,
  outputPricing: number
): number {
  const inputCost = (inputTokens / 1_000_000) * inputPricing
  const outputCost = (outputTokens / 1_000_000) * outputPricing
  return inputCost + outputCost
}

/**
 * Format token count with thousands separator
 * @param tokens - Token count
 * @returns Formatted string (e.g., "1,234 tokens")
 */
export function formatTokenCount(tokens: number): string {
  return `${tokens.toLocaleString()} ${tokens === 1 ? 'token' : 'tokens'}`
}

/**
 * Format cost with currency
 * @param cost - Cost in dollars
 * @returns Formatted string (e.g., "$0.0012")
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00'
  if (cost < 0.0001) return '<$0.0001'
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

/**
 * Calculate chat memory token usage
 * @param messageCount - Number of messages to include
 * @param avgMessageLength - Average message length in characters
 * @returns Estimated token count for chat memory
 */
export function estimateChatMemoryTokens(
  messageCount: number,
  avgMessageLength: number = 200
): number {
  if (messageCount === 0) return 0

  // Estimate tokens per message (content + overhead)
  const tokensPerMessage = Math.ceil(avgMessageLength / 4) + 4

  return messageCount * tokensPerMessage
}

/**
 * Get token usage tier label
 * @param tokens - Token count
 * @returns Usage tier label (Low, Medium, High, Very High)
 */
export function getTokenUsageTier(tokens: number): {
  label: string
  color: string
} {
  if (tokens < 1000) {
    return { label: 'Low', color: 'text-green-600' }
  } else if (tokens < 4000) {
    return { label: 'Medium', color: 'text-yellow-600' }
  } else if (tokens < 8000) {
    return { label: 'High', color: 'text-orange-600' }
  } else {
    return { label: 'Very High', color: 'text-red-600' }
  }
}
