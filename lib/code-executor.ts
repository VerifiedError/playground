/**
 * E2B Code Interpreter Client
 *
 * Provides sandboxed Python code execution using E2B's cloud sandboxes.
 * Requires E2B_API_KEY environment variable.
 *
 * Setup:
 * 1. Sign up: https://e2b.dev/
 * 2. Get API key from dashboard
 * 3. Add to .env.local:
 *    E2B_API_KEY=your_api_key
 *
 * Cost: Free tier 100 executions/month, Paid $10/month
 */

import { CodeInterpreter } from '@e2b/code-interpreter'

export interface CodeExecutionParams {
  code: string
  language?: 'python' | 'javascript' // Currently only Python supported by E2B
  timeout?: number // Timeout in milliseconds (max 60000)
}

export interface CodeExecutionResponse {
  stdout: string
  stderr: string
  error?: string
  executionTime: number
  logs: string[]
}

/**
 * Execute Python code in E2B sandbox
 */
export async function executeCode(params: CodeExecutionParams): Promise<CodeExecutionResponse> {
  const { code, language = 'python', timeout = 30000 } = params

  const apiKey = process.env.E2B_API_KEY

  // Validate environment variable
  if (!apiKey) {
    console.warn('⚠️  E2B not configured. Add E2B_API_KEY to .env.local')
    return mockCodeExecution(code, language)
  }

  // E2B only supports Python currently
  if (language !== 'python') {
    return {
      stdout: '',
      stderr: `Language "${language}" not supported. E2B currently only supports Python.`,
      error: 'Unsupported language',
      executionTime: 0,
      logs: [],
    }
  }

  try {
    const sandbox = await CodeInterpreter.create({ apiKey, timeout: timeout })
    const startTime = Date.now()

    try {
      const execution = await sandbox.notebook.execCell(code)
      const executionTime = Date.now() - startTime

      // Collect all logs
      const logs: string[] = []
      if (execution.logs.stdout.length > 0) {
        logs.push(...execution.logs.stdout)
      }
      if (execution.logs.stderr.length > 0) {
        logs.push(...execution.logs.stderr)
      }

      // Check for errors
      let error: string | undefined
      if (execution.error) {
        error = `${execution.error.name}: ${execution.error.value}\n${execution.error.traceback || ''}`
      }

      // Get stdout/stderr
      const stdout = execution.logs.stdout.join('\n')
      const stderr = execution.logs.stderr.join('\n')

      // Include cell results if present
      let resultOutput = stdout
      if (execution.results.length > 0) {
        const results = execution.results.map((r) => {
          if (r.text) return r.text
          if (r.png) return '[PNG Image]'
          if (r.svg) return '[SVG Image]'
          if (r.jpeg) return '[JPEG Image]'
          if (r.pdf) return '[PDF Document]'
          if (r.html) return '[HTML Content]'
          return '[Unknown Result Type]'
        }).join('\n')
        resultOutput = results || stdout
      }

      return {
        stdout: resultOutput,
        stderr,
        error,
        executionTime,
        logs,
      }
    } finally {
      // Always close sandbox
      await sandbox.close()
    }
  } catch (error: any) {
    console.error('Code execution error:', error)

    // Fallback to mock on error
    return mockCodeExecution(code, language)
  }
}

/**
 * Mock code execution for development/fallback
 */
function mockCodeExecution(code: string, language: string): CodeExecutionResponse {
  console.log(`🐍 Using mock code execution for ${language}`)

  // Simple mock output
  const lines = code.split('\n').length
  const mockStdout = `Mock execution of ${lines} lines of ${language} code.\n\nIn production, this would execute in E2B sandbox.\n\nCode:\n${code.substring(0, 200)}${code.length > 200 ? '...' : ''}`

  return {
    stdout: mockStdout,
    stderr: '',
    executionTime: 50,
    logs: [mockStdout],
  }
}

/**
 * Format code execution results as readable text
 */
export function formatCodeExecutionResult(response: CodeExecutionResponse): string {
  let output = `Execution time: ${response.executionTime}ms\n\n`

  if (response.stdout) {
    output += `Output:\n${response.stdout}\n\n`
  }

  if (response.stderr) {
    output += `Errors:\n${response.stderr}\n\n`
  }

  if (response.error) {
    output += `Error:\n${response.error}\n`
  }

  return output.trim()
}
