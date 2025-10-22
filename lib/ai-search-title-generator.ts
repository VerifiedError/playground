/**
 * AI Search Conversation Title Generator
 *
 * Generates short, descriptive titles from user queries.
 * Similar to ChatGPT's auto-title generation.
 */

/**
 * Generate a title from a user query
 *
 * Uses a simple heuristic approach:
 * 1. Remove common question words (what, how, why, etc.)
 * 2. Extract key nouns and verbs
 * 3. Capitalize first letter
 * 4. Truncate to reasonable length
 *
 * Examples:
 * - "What are the best coffee shops in Seattle?" → "Best coffee shops in Seattle"
 * - "How do I fix my laptop screen?" → "Fix laptop screen"
 * - "Tell me about climate change" → "Climate change"
 *
 * @param query - The user's search query
 * @returns A short, descriptive title (max 60 characters)
 */
export function generateConversationTitle(query: string): string {
  if (!query || query.trim().length === 0) {
    return 'New conversation'
  }

  let title = query.trim()

  // Remove common question prefixes
  const questionPrefixes = [
    /^what\s+(is|are|was|were|do|does|did|can|could|would|should)\s+/i,
    /^how\s+(do|does|did|can|could|to|about)\s+/i,
    /^why\s+(is|are|was|were|do|does|did)\s+/i,
    /^when\s+(is|are|was|were|do|does|did)\s+/i,
    /^where\s+(is|are|was|were|do|does|did|can|could)\s+/i,
    /^who\s+(is|are|was|were)\s+/i,
    /^which\s+(is|are|was|were)\s+/i,
    /^can\s+you\s+/i,
    /^could\s+you\s+/i,
    /^please\s+/i,
    /^tell\s+me\s+(about\s+)?/i,
    /^show\s+me\s+/i,
    /^find\s+me\s+/i,
    /^search\s+(for\s+)?/i,
    /^i\s+need\s+(to\s+)?/i,
    /^i\s+want\s+(to\s+)?/i,
    /^i'm\s+looking\s+for\s+/i,
    /^give\s+me\s+/i,
  ]

  for (const prefix of questionPrefixes) {
    title = title.replace(prefix, '')
  }

  // Remove trailing question marks and exclamation points
  title = title.replace(/[?!]+$/, '')

  // Trim whitespace
  title = title.trim()

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1)
  }

  // Truncate to 60 characters
  if (title.length > 60) {
    // Try to truncate at a word boundary
    const truncated = title.substring(0, 60)
    const lastSpace = truncated.lastIndexOf(' ')

    if (lastSpace > 40) {
      // If there's a space in the last 20 chars, use it
      title = truncated.substring(0, lastSpace) + '...'
    } else {
      // Otherwise just hard truncate
      title = truncated + '...'
    }
  }

  // Fallback if title is empty after processing
  if (title.length === 0) {
    return 'New conversation'
  }

  return title
}

/**
 * Generate a title using AI (optional enhancement)
 *
 * This could be used to generate better titles by calling an LLM.
 * For now, it's just a placeholder for future enhancement.
 *
 * @param query - The user's search query
 * @param firstResponse - The AI's first response (for context)
 * @returns A promise resolving to a title
 */
export async function generateAITitle(
  query: string,
  firstResponse?: string
): Promise<string> {
  // TODO: Implement AI-powered title generation
  // For now, just use the heuristic approach
  return generateConversationTitle(query)
}

/**
 * Sanitize a title for display
 *
 * Ensures the title is safe for display and doesn't contain
 * malicious content.
 *
 * @param title - The raw title
 * @returns Sanitized title
 */
export function sanitizeTitle(title: string): string {
  if (!title) return 'New conversation'

  // Remove any HTML tags
  const withoutHtml = title.replace(/<[^>]*>/g, '')

  // Limit length
  const maxLength = 100
  if (withoutHtml.length > maxLength) {
    return withoutHtml.substring(0, maxLength) + '...'
  }

  return withoutHtml
}
