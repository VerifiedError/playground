/**
 * AI Search Agent Library
 *
 * Intelligent search assistant using Groq LLM + Serper API
 * - Analyzes user queries in natural language
 * - Automatically selects optimal search type
 * - Executes ONE Serper API call (credit limit: 1 per query)
 * - Returns full JSON results with conversational AI summary
 *
 * Default model: llama-3.1-8b-instant ($0.05/$0.08 per 1M tokens)
 */

import { groq } from './groq'
import type { SerperSearchType, SerperResponse } from './serper-types'

// ================== Interfaces ==================

export interface AISearchAgentConfig {
  model: string // AI model to use
  maxTokens: number // Max output tokens
  temperature: number // Response creativity (0-2)
}

export interface AISearchResult {
  query: string // Original user query
  searchType: SerperSearchType // AI-chosen search type
  searchQuery: string // Optimized search query for API
  results: SerperResponse // Full JSON from Serper API
  aiResponse: string // AI's conversational summary
  reasoning?: string // AI's reasoning for search type choice
  cost: {
    inputTokens: number
    outputTokens: number
    totalCost: number // In USD
  }
}

interface SearchToolCall {
  query: string
  type: SerperSearchType
  num?: number
}

// ================== Configuration ==================

export const DEFAULT_AI_CONFIG: AISearchAgentConfig = {
  model: 'groq/compound',
  maxTokens: 2000,
  temperature: 0.3, // Focused, deterministic responses
}

// Pricing for llama-3.1-8b-instant (per 1M tokens)
const MODEL_PRICING = {
  'llama-3.1-8b-instant': {
    input: 0.05,
    output: 0.08,
  },
  'llama-3.3-70b-versatile': {
    input: 0.59,
    output: 0.79,
  },
  'meta-llama/llama-4-scout-17b-16e-instruct': {
    input: 0.11,
    output: 0.34,
  },
}

// ================== System Prompt ==================

const AI_SEARCH_SYSTEM_PROMPT = `You are a search assistant that helps users find information using web search.

Your role:
1. Analyze the user's question to determine the best search type:
   - "search" (web): General queries, facts, news, articles, definitions
   - "images": Visual content, photos, graphics, pictures
   - "videos": Video content, tutorials, clips, streaming
   - "places": Physical locations, restaurants, venues, businesses
   - "maps": Directions, map data, geographic information
   - "news": Recent news, current events, breaking stories
   - "scholar": Academic papers, research, citations, scientific articles
   - "shopping": Products, prices, e-commerce, buying guides

2. Optimize the search query:
   - Remove question words (what, when, where, how, why)
   - Extract only the essential keywords
   - Keep it concise and specific
   - Example transformations:
     * "What are the best Italian restaurants in NYC?" → "best Italian restaurants NYC"
     * "How do I fix a leaking faucet?" → "fix leaking faucet tutorial"
     * "Where can I buy cheap laptops?" → "cheap laptops buy"

3. Call the search_web function ONCE with:
   - Optimized query
   - Correct search type
   - Number of results (default 10, max 20)

4. After receiving results, provide a helpful, conversational summary

CRITICAL CONSTRAINTS:
- You can ONLY call search_web ONCE per user query (strict credit limit)
- Maximum 20 results per search
- Choose the most appropriate search type on your first attempt
- If uncertain, default to "search" (web) type`

// ================== Tool Definition ==================

const SERPER_SEARCH_TOOL = {
  type: 'function' as const,
  function: {
    name: 'search_web',
    description: 'Search the web using Serper API. Choose the appropriate search type based on user intent.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optimized search query with keywords only (no question words)',
        },
        type: {
          type: 'string',
          enum: ['search', 'images', 'videos', 'places', 'maps', 'news', 'scholar', 'shopping'],
          description: 'Search type based on user intent',
        },
        num: {
          type: 'number',
          description: 'Number of results to return (default: 10, max: 20)',
          default: 10,
        },
      },
      required: ['query', 'type'],
    },
  },
}

// ================== Helper Functions ==================

/**
 * Execute Serper API search
 */
async function executeSerperSearch(
  query: string,
  type: SerperSearchType,
  num: number = 10
): Promise<SerperResponse> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      q: query,
      num: Math.min(num, 20), // Enforce 20 max
      gl: 'us',
      hl: 'en',
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Search failed')
  }

  const data = await response.json()
  return data.results
}

/**
 * Calculate cost for AI search
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING['llama-3.1-8b-instant']

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}

// ================== Main Function ==================

/**
 * Perform AI-powered search
 *
 * @param userQuery - Natural language query from user
 * @param config - AI configuration (model, temperature, etc.)
 * @returns AI search results with full JSON data
 */
export async function performAISearch(
  userQuery: string,
  config: AISearchAgentConfig = DEFAULT_AI_CONFIG
): Promise<AISearchResult> {
  try {
    // Step 1: First AI call - Analyze query and choose search type
    const initialResponse = await groq.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: AI_SEARCH_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userQuery,
        },
      ],
      tools: [SERPER_SEARCH_TOOL],
      tool_choice: 'auto',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    })

    const initialMessage = initialResponse.choices[0]?.message
    if (!initialMessage) {
      throw new Error('No response from AI')
    }

    // Extract token usage
    const inputTokens = initialResponse.usage?.prompt_tokens || 0
    let outputTokens = initialResponse.usage?.completion_tokens || 0

    // Step 2: Check if AI called the search tool
    const toolCalls = initialMessage.tool_calls
    if (!toolCalls || toolCalls.length === 0) {
      throw new Error('AI did not execute search. Try rephrasing your query.')
    }

    const searchToolCall = toolCalls[0]
    const searchArgs: SearchToolCall = JSON.parse(searchToolCall.function.arguments)

    // Step 3: Execute Serper API search
    const searchResults = await executeSerperSearch(
      searchArgs.query,
      searchArgs.type,
      searchArgs.num || 10
    )

    // Step 4: Second AI call - Summarize results
    const summaryResponse = await groq.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: AI_SEARCH_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userQuery,
        },
        {
          role: 'assistant',
          content: initialMessage.content || null,
          tool_calls: toolCalls,
        },
        {
          role: 'tool',
          tool_call_id: searchToolCall.id,
          content: JSON.stringify(searchResults),
        },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    })

    const summaryMessage = summaryResponse.choices[0]?.message
    if (!summaryMessage || !summaryMessage.content) {
      throw new Error('Failed to generate AI summary')
    }

    // Update token usage
    outputTokens += summaryResponse.usage?.completion_tokens || 0

    // Calculate total cost
    const totalCost = calculateCost(config.model, inputTokens, outputTokens)

    // Return complete result
    return {
      query: userQuery,
      searchType: searchArgs.type,
      searchQuery: searchArgs.query,
      results: searchResults,
      aiResponse: summaryMessage.content,
      reasoning: initialMessage.content || undefined,
      cost: {
        inputTokens,
        outputTokens,
        totalCost,
      },
    }
  } catch (error: any) {
    console.error('[AI Search Agent] Error:', error)
    throw new Error(`AI search failed: ${error.message}`)
  }
}

/**
 * Validate AI search configuration
 */
export function validateAIConfig(config: Partial<AISearchAgentConfig>): AISearchAgentConfig {
  return {
    model: config.model || DEFAULT_AI_CONFIG.model,
    maxTokens: Math.min(config.maxTokens || DEFAULT_AI_CONFIG.maxTokens, 8000),
    temperature: Math.max(0, Math.min(config.temperature || DEFAULT_AI_CONFIG.temperature, 2)),
  }
}
