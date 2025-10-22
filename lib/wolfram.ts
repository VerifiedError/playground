/**
 * Wolfram Alpha API Client
 *
 * Provides computational knowledge engine queries for math, science, and data.
 * Requires WOLFRAM_APP_ID environment variable.
 *
 * Setup:
 * 1. Sign up: https://products.wolframalpha.com/api/
 * 2. Get App ID from dashboard
 * 3. Add to .env.local:
 *    WOLFRAM_APP_ID=your_app_id
 *
 * Cost: Free tier 2000 queries/month, Paid $4.99-$99/month
 */

import WolframAlphaAPI from 'wolfram-alpha-api'

export interface WolframQueryParams {
  query: string
  format?: 'short' | 'full' // short = simple answer, full = detailed response
}

export interface WolframQueryResponse {
  input: string
  output: string
  pods: WolframPod[]
  success: boolean
  error?: string
}

export interface WolframPod {
  title: string
  subpods: WolframSubpod[]
}

export interface WolframSubpod {
  plaintext: string
  img?: string
}

/**
 * Query Wolfram Alpha
 */
export async function wolframQuery(params: WolframQueryParams): Promise<WolframQueryResponse> {
  const { query, format = 'short' } = params

  const appId = process.env.WOLFRAM_APP_ID

  // Validate environment variable
  if (!appId) {
    console.warn('⚠️  Wolfram Alpha not configured. Add WOLFRAM_APP_ID to .env.local')
    return mockWolframQuery(query)
  }

  try {
    const waApi = WolframAlphaAPI(appId)

    if (format === 'short') {
      // Simple short answer API
      const result = await waApi.getShort(query)
      return {
        input: query,
        output: result,
        pods: [],
        success: true,
      }
    } else {
      // Full answer API with pods
      const result = await waApi.getFull(query)

      if (!result.success) {
        throw new Error(result.error || 'Wolfram Alpha query failed')
      }

      const pods: WolframPod[] = (result.pods || []).map((pod: any) => ({
        title: pod.title || '',
        subpods: (pod.subpods || []).map((subpod: any) => ({
          plaintext: subpod.plaintext || '',
          img: subpod.img?.src,
        })),
      }))

      // Get primary result
      const primaryPod = pods.find((p) => p.title.includes('Result') || p.title.includes('Value'))
      const output = primaryPod?.subpods[0]?.plaintext || pods[0]?.subpods[0]?.plaintext || 'No result'

      return {
        input: query,
        output,
        pods,
        success: true,
      }
    }
  } catch (error: any) {
    console.error('Wolfram Alpha error:', error)

    // Fallback to mock on error
    return mockWolframQuery(query)
  }
}

/**
 * Mock Wolfram Alpha query for development/fallback
 */
function mockWolframQuery(query: string): WolframQueryResponse {
  console.log(`🧮 Using mock Wolfram Alpha for: "${query}"`)

  // Simple mock responses for common query types
  let mockOutput = ''
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('integral') || lowerQuery.includes('derivative')) {
    mockOutput = `Mock result for calculus query. In production, Wolfram Alpha would compute: ${query}`
  } else if (lowerQuery.includes('solve') || lowerQuery.includes('=')) {
    mockOutput = `Mock solution. In production, Wolfram Alpha would solve: ${query}`
  } else if (lowerQuery.match(/\d+[\s\+\-\*\/\^]+\d+/)) {
    mockOutput = `Mock computation result. In production, Wolfram Alpha would calculate: ${query}`
  } else if (lowerQuery.includes('convert') || lowerQuery.includes('to')) {
    mockOutput = `Mock unit conversion. In production, Wolfram Alpha would convert: ${query}`
  } else if (lowerQuery.includes('population') || lowerQuery.includes('gdp') || lowerQuery.includes('distance')) {
    mockOutput = `Mock data result. In production, Wolfram Alpha would provide data for: ${query}`
  } else {
    mockOutput = `Mock Wolfram Alpha result for "${query}". Configure WOLFRAM_APP_ID to get real computational results.`
  }

  return {
    input: query,
    output: mockOutput,
    pods: [
      {
        title: 'Mock Result',
        subpods: [{ plaintext: mockOutput }],
      },
    ],
    success: true,
  }
}

/**
 * Format Wolfram Alpha result as readable text
 */
export function formatWolframResult(response: WolframQueryResponse): string {
  if (!response.success) {
    return `Error: ${response.error || 'Query failed'}`
  }

  let output = `Query: ${response.input}\n\n`
  output += `Result: ${response.output}\n`

  if (response.pods.length > 1) {
    output += '\n--- Detailed Results ---\n\n'
    response.pods.forEach((pod) => {
      output += `${pod.title}:\n`
      pod.subpods.forEach((subpod) => {
        if (subpod.plaintext) {
          output += `  ${subpod.plaintext}\n`
        }
        if (subpod.img) {
          output += `  [Image: ${subpod.img}]\n`
        }
      })
      output += '\n'
    })
  }

  return output.trim()
}
