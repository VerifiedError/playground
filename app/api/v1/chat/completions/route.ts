/**
 * External Chat Completion API (OpenAI-compatible)
 *
 * POST /api/v1/chat/completions
 *
 * Accepts chat completion requests from external applications using API keys.
 * Compatible with OpenAI's chat completion API format.
 *
 * Authentication: Bearer token (API key)
 * Example: Authorization: Bearer pk_live_abc123...
 */

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { validateApiKey, createApiKeyErrorResponse } from '@/lib/api-key-middleware'
import { prisma } from '@/lib/prisma'
import { calculateMessageCost } from '@/lib/cost-calculator'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

/**
 * POST /api/v1/chat/completions
 * OpenAI-compatible chat completion endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const validation = await validateApiKey(request, 'chat')

    if (!validation.valid) {
      return createApiKeyErrorResponse(validation.error || 'Invalid API key', validation.status || 401)
    }

    // Parse request body
    const body = await request.json()
    const {
      model = 'llama-3.3-70b-versatile',
      messages,
      temperature = 0.7,
      max_tokens = 2048,
      top_p = 0.9,
      stream = false,
      tools,
      tool_choice,
      web_search = false,
    } = body

    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            message: 'messages is required and must be a non-empty array',
            type: 'invalid_request_error',
            param: 'messages',
            code: 'missing_required_parameter',
          },
        },
        { status: 400 }
      )
    }

    // Validate messages format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          {
            error: {
              message: 'Each message must have role and content',
              type: 'invalid_request_error',
              param: 'messages',
              code: 'invalid_value',
            },
          },
          { status: 400 }
        )
      }
    }

    // Build Groq API request
    const groqRequest: any = {
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      stream,
    }

    // Add tools if provided
    if (tools && Array.isArray(tools) && tools.length > 0) {
      groqRequest.tools = tools
      if (tool_choice) {
        groqRequest.tool_choice = tool_choice
      }
    }

    // Add web search if enabled
    if (web_search) {
      groqRequest.web_search = true
    }

    // Streaming response
    if (stream) {
      const completion = await groq.chat.completions.create(groqRequest)

      // Create a ReadableStream for SSE
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const delta = chunk.choices[0]?.delta

              if (delta) {
                const sseData = `data: ${JSON.stringify({
                  id: chunk.id,
                  object: 'chat.completion.chunk',
                  created: chunk.created,
                  model: chunk.model,
                  choices: [
                    {
                      index: 0,
                      delta,
                      finish_reason: chunk.choices[0]?.finish_reason || null,
                    },
                  ],
                })}\n\n`

                controller.enqueue(encoder.encode(sseData))
              }
            }

            // Send [DONE] message
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error: any) {
            console.error('Streaming error:', error)
            controller.error(error)
          }
        },
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Non-streaming response
    const completion = await groq.chat.completions.create(groqRequest)

    // Extract usage info
    const usage = completion.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    }

    // Calculate cost
    const cost = calculateMessageCost(model, usage.prompt_tokens, usage.completion_tokens)

    // Get user from validation
    const userId = validation.userId!

    // Create a session for this API request (optional - for tracking)
    const session = await prisma.agenticSession.create({
      data: {
        userId,
        title: `API Request - ${model}`,
        model,
        totalCost: cost,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        messageCount: messages.length + 1, // User messages + assistant response
      },
    })

    // Store messages in database (optional - for tracking)
    for (const msg of messages) {
      await prisma.agenticMessage.create({
        data: {
          sessionId: session.id,
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          inputTokens: 0, // We don't know individual message tokens
          outputTokens: 0,
          cost: 0,
        },
      })
    }

    // Store assistant response
    const assistantMessage = completion.choices[0]?.message
    if (assistantMessage) {
      await prisma.agenticMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: assistantMessage.content || '',
          toolCalls: assistantMessage.tool_calls ? JSON.stringify(assistantMessage.tool_calls) : null,
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          cost,
        },
      })
    }

    // Return OpenAI-compatible response
    return NextResponse.json({
      id: completion.id,
      object: 'chat.completion',
      created: completion.created,
      model: completion.model,
      choices: completion.choices.map((choice) => ({
        index: choice.index,
        message: choice.message,
        finish_reason: choice.finish_reason,
      })),
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      x_playground: {
        // Custom metadata
        session_id: session.id,
        cost,
        api_key_id: validation.apiKeyId,
      },
    })
  } catch (error: any) {
    console.error('Error in external chat completion:', error)

    // Check if it's a Groq API error
    if (error.status) {
      return NextResponse.json(
        {
          error: {
            message: error.message || 'Groq API error',
            type: 'groq_error',
            code: error.code || 'unknown_error',
          },
        },
        { status: error.status }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Internal server error',
          type: 'server_error',
          code: 'internal_error',
        },
      },
      { status: 500 }
    )
  }
}
