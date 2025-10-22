/**
 * Groq Built-in Tools Definitions
 *
 * Groq provides several built-in tools that can be enabled in chat completions:
 * - Web Search (Google-powered search)
 * - Browser Automation (visit websites, interact with pages)
 * - Code Execution (Python sandbox)
 * - Wolfram Alpha (computational intelligence)
 *
 * Documentation:
 * - Web Search: https://console.groq.com/docs/web-search
 * - Browser Automation: https://console.groq.com/docs/browser-automation
 * - Code Execution: https://console.groq.com/docs/code-execution
 * - Wolfram Alpha: https://console.groq.com/docs/wolfram-alpha
 */

/**
 * Tool definitions in Groq SDK format
 * These are passed to groq.chat.completions.create({ tools: [...] })
 */
export const GROQ_WEB_SEARCH_TOOL = {
  type: 'function' as const,
  function: {
    name: 'web_search',
    description: 'Search the web for current information, news, facts, and answers. Use this when you need up-to-date information or when the user asks about recent events, news, or information you don\'t have in your training data.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up on the web. Be specific and use relevant keywords.',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of search results to return (default: 5, max: 10)',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
}

export const GROQ_BROWSER_AUTOMATION_TOOL = {
  type: 'function' as const,
  function: {
    name: 'browser_automation',
    description: 'Visit a website and extract content, interact with pages, fill forms, click buttons, or take screenshots. Use this when you need to access specific websites or perform actions on web pages.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['visit', 'click', 'fill_form', 'screenshot', 'extract'],
          description: 'The action to perform on the website',
        },
        url: {
          type: 'string',
          description: 'The URL of the website to visit or interact with',
        },
        selector: {
          type: 'string',
          description: 'CSS selector for the element to interact with (for click, fill_form, extract actions)',
        },
        value: {
          type: 'string',
          description: 'Value to enter (for fill_form action)',
        },
      },
      required: ['action', 'url'],
    },
  },
}

export const GROQ_CODE_EXECUTION_TOOL = {
  type: 'function' as const,
  function: {
    name: 'code_execution',
    description: 'Execute Python code in a secure sandbox environment. Use this for computations, data analysis, generating plots, or running algorithms. The code runs in an isolated environment with common libraries available (numpy, pandas, matplotlib, etc.).',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The Python code to execute. Can use print() to output results.',
        },
        timeout: {
          type: 'number',
          description: 'Execution timeout in seconds (default: 30, max: 300)',
          default: 30,
        },
      },
      required: ['code'],
    },
  },
}

export const GROQ_WOLFRAM_ALPHA_TOOL = {
  type: 'function' as const,
  function: {
    name: 'wolfram_alpha',
    description: 'Query Wolfram Alpha for mathematical computations, scientific data, unit conversions, historical facts, and more. Use this for precise calculations, solving equations, plotting functions, or looking up scientific/mathematical information.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The query to send to Wolfram Alpha. Can be a math problem, unit conversion, scientific question, etc.',
        },
        format: {
          type: 'string',
          enum: ['plaintext', 'image', 'both'],
          description: 'Output format preference (default: both)',
          default: 'both',
        },
      },
      required: ['query'],
    },
  },
}

/**
 * Get all available Groq tools based on model capabilities
 */
export function getAvailableTools(modelCapabilities: {
  supportsWebSearch?: boolean
  supportsCodeExecution?: boolean
  supportsBrowserAutomation?: boolean
  supportsWolframAlpha?: boolean
}) {
  const tools: any[] = []

  if (modelCapabilities.supportsWebSearch) {
    tools.push(GROQ_WEB_SEARCH_TOOL)
  }

  if (modelCapabilities.supportsBrowserAutomation) {
    tools.push(GROQ_BROWSER_AUTOMATION_TOOL)
  }

  if (modelCapabilities.supportsCodeExecution) {
    tools.push(GROQ_CODE_EXECUTION_TOOL)
  }

  if (modelCapabilities.supportsWolframAlpha) {
    tools.push(GROQ_WOLFRAM_ALPHA_TOOL)
  }

  return tools
}

/**
 * Tool usage tracking for cost calculation
 */
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string // JSON string
  }
}

export interface ToolResult {
  tool_call_id: string
  role: 'tool'
  name: string
  content: string
}

/**
 * Parse tool call arguments safely
 */
export function parseToolArguments(argsString: string): Record<string, any> {
  try {
    return JSON.parse(argsString)
  } catch (error) {
    console.error('Failed to parse tool arguments:', error)
    return {}
  }
}

/**
 * Format tool result for display in UI
 */
export function formatToolResult(toolName: string, result: string): {
  title: string
  content: string
  icon: string
} {
  switch (toolName) {
    case 'web_search':
      return {
        title: 'Web Search Results',
        content: result,
        icon: 'search',
      }
    case 'browser_automation':
      return {
        title: 'Browser Automation',
        content: result,
        icon: 'globe',
      }
    case 'code_execution':
      return {
        title: 'Code Execution Result',
        content: result,
        icon: 'code',
      }
    case 'wolfram_alpha':
      return {
        title: 'Wolfram Alpha Result',
        content: result,
        icon: 'calculator',
      }
    default:
      return {
        title: 'Tool Result',
        content: result,
        icon: 'tool',
      }
  }
}
