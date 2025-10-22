/**
 * AI Chat API Endpoint for Search Playground
 *
 * POST /api/search/playground/chat
 *
 * Provides AI assistance with access to search results context.
 * Users can ask questions about results, get summaries, build prompts, etc.
 *
 * Request:
 * {
 *   message: string,           // User's message
 *   searchResults: any,        // Current search results (SerperResponse)
 *   conversationHistory: Array // Previous messages in conversation
 *   model?: string,            // AI model (default: groq/compound)
 *   temperature?: number,      // Temperature (0-2)
 *   maxTokens?: number,        // Max output tokens
 *   systemPrompt?: string,     // Custom system prompt
 *   enabledTools?: string[],   // Groq Compound tools: web_search, visit_website, browser_automation, code_interpreter, wolfram_alpha
 * }
 *
 * Response: Streaming SSE with tool execution metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Default enabled tools for Compound model
const DEFAULT_COMPOUND_TOOLS = [
  'web_search',
  'code_interpreter',
  'visit_website',
  'wolfram_alpha',
]

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      searchResults,
      conversationHistory,
      model,
      temperature,
      maxTokens,
      systemPrompt: customSystemPrompt,
      enabledTools,
    } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use provided model or default to Compound AI
    const selectedModel = model || 'groq/compound'

    // Use custom system prompt if provided, otherwise build from search results
    const systemPrompt = customSystemPrompt || buildSystemPrompt(searchResults)

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Add conversation history (filter out system messages to avoid duplication)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const filteredHistory = conversationHistory.filter(
        (msg: any) => msg.role !== 'system'
      )
      messages.push(...filteredHistory)
    }

    // Add current user message
    messages.push({ role: 'user', content: message })

    // Build request options
    const requestOptions: any = {
      model: selectedModel,
      messages,
      temperature: temperature !== undefined ? temperature : 0.7,
      max_tokens: maxTokens || 2048,
      stream: true,
    }

    // Add Compound tool configuration if using groq/compound
    if (selectedModel === 'groq/compound' || selectedModel.startsWith('groq/compound')) {
      const tools = enabledTools && Array.isArray(enabledTools) && enabledTools.length > 0
        ? enabledTools
        : DEFAULT_COMPOUND_TOOLS

      requestOptions.compound_custom = {
        tools: {
          enabled_tools: tools,
        },
      }
    }

    // Create streaming response with customizable parameters
    const stream = await groq.chat.completions.create(requestOptions)

    // Create readable stream for SSE
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let lastChunk: any = null

          for await (const chunk of stream) {
            lastChunk = chunk
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }

          // Send tool execution metadata if available (Compound AI)
          if (lastChunk) {
            const executedTools = (lastChunk as any).executed_tools
            const usageBreakdown = lastChunk.usage_breakdown

            if (executedTools || usageBreakdown) {
              const metadata: any = {}
              if (executedTools) metadata.executedTools = executedTools
              if (usageBreakdown) metadata.usageBreakdown = usageBreakdown

              const metadataEvent = `data: ${JSON.stringify({ metadata })}\n\n`
              controller.enqueue(encoder.encode(metadataEvent))
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}

/**
 * Build system prompt with search results context
 */
function buildSystemPrompt(searchResults: any): string {
  const hasResults = searchResults && Object.keys(searchResults).length > 0

  // Playground mode (no search results) - pure AI chat
  if (!hasResults || searchResults?.searchParameters?.type === 'playground') {
    return `You are a helpful AI assistant in the playground mode.

Your role:
- Help with coding, debugging, and software development
- Explain complex concepts clearly
- Provide creative solutions and ideas
- Assist with problem-solving and analysis
- Generate and review code
- Answer questions across various topics

Be helpful, accurate, and concise. Use markdown formatting for code blocks and structured content.`
  }

  // LeakCheck mode - direct data output (like talking to JSON)
  if (searchResults?.searchParameters?.type === 'leakcheck') {
    const truncatedResults = truncateResults(searchResults)
    const resultsJson = JSON.stringify(truncatedResults, null, 2)

    return `DATA SOURCE: LeakCheck API
RESULTS:
${resultsJson}

INSTRUCTIONS:
- Output ONLY requested data in plain structured format
- NO conversational language, greetings, or pleasantries
- NO markdown formatting unless specifically asked
- Be EXTREMELY brief - single words or short phrases
- Structure output like JSON fields: "Field: Value"
- When asked "what", "list", "show" - output raw data only
- When asked to "analyze" - output bullet points with key:value pairs
- NO explanations unless explicitly requested
- NO advice, recommendations, or suggestions unless asked

EXAMPLES:
User: "what breaches"
You: "Sources: 17
Dates: 2015-2023
Types: passwords, emails, usernames"

User: "list sources"
You: "LinkedIn 2021
Adobe 2013
Collection1 2019
[...]"

User: "analyze passwords"
You: "Total: 5
Plaintext: 3
Hashed: 2
Algorithms: MD5, SHA1"`
  }

  // Search results mode - analyze Serper.dev results
  // Truncate results for token efficiency (keep first 10 items of each type)
  const truncatedResults = truncateResults(searchResults)
  const resultsJson = JSON.stringify(truncatedResults, null, 2)

  return `You are a helpful AI assistant for the Serper.dev search playground.

Your role:
- Analyze and explain search results
- Suggest ways to use the data
- Help build prompts and workflows
- Extract insights and patterns
- Answer questions about the results

CURRENT SEARCH RESULTS:
\`\`\`json
${resultsJson}
\`\`\`

Guidelines:
- Reference specific results when answering
- Suggest actionable next steps
- Help users understand the data structure
- Be concise but informative
- Offer to help with specific tasks (summarization, extraction, analysis, etc.)`
}

/**
 * Truncate results to avoid token limit
 */
function truncateResults(results: any): any {
  const truncated: any = {}

  // Truncate arrays to first 10 items
  for (const [key, value] of Object.entries(results)) {
    if (Array.isArray(value)) {
      truncated[key] = value.slice(0, 10)
    } else if (typeof value === 'object' && value !== null) {
      truncated[key] = value
    } else {
      truncated[key] = value
    }
  }

  return truncated
}
