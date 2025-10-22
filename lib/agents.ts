/**
 * Agent Definitions for Multi-Agent Workflows
 * Defines specialized agent personas with different capabilities
 */

export type AgentType = 'researcher' | 'coder' | 'writer' | 'analyst' | 'custom'

export interface Agent {
  id: string
  type: AgentType
  name: string
  description: string
  capabilities: string[]
  systemPrompt: string
  modelPreference?: string // Preferred model for this agent
  temperature?: number
  maxTokens?: number
}

export interface AgentAction {
  name: string
  description: string
  inputSchema: Record<string, any>
  execute: (input: any, context: WorkflowContext) => Promise<any>
}

export interface WorkflowContext {
  sessionId?: string
  userId?: number
  variables: Record<string, any>
  stepResults: Record<string, any>
  groqApiKey?: string
}

// ==================== BUILT-IN AGENT DEFINITIONS ====================

export const AGENT_DEFINITIONS: Record<AgentType, Omit<Agent, 'id'>> = {
  researcher: {
    type: 'researcher',
    name: 'Researcher',
    description: 'Specialized in web search, data gathering, and information synthesis',
    capabilities: ['web_search', 'summarize', 'extract_facts', 'find_sources'],
    systemPrompt: `You are a research specialist. Your role is to:
1. Conduct thorough web searches on given topics
2. Synthesize information from multiple sources
3. Extract key facts, statistics, and insights
4. Provide properly cited sources
5. Identify credible vs questionable information

When researching, be comprehensive but concise. Focus on accuracy and credibility.`,
    modelPreference: 'groq/compound',
    temperature: 0.3,
    maxTokens: 4096,
  },

  coder: {
    type: 'coder',
    name: 'Coder',
    description: 'Specialized in code generation, execution, debugging, and testing',
    capabilities: ['generate_code', 'execute_code', 'debug', 'test', 'refactor'],
    systemPrompt: `You are an expert software engineer. Your role is to:
1. Write clean, efficient, well-documented code
2. Execute and test code to verify correctness
3. Debug errors and fix issues
4. Refactor code for better performance and readability
5. Follow best practices and design patterns

When coding, prioritize correctness, clarity, and maintainability.`,
    modelPreference: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    maxTokens: 8192,
  },

  writer: {
    type: 'writer',
    name: 'Writer',
    description: 'Specialized in content creation, editing, and creative writing',
    capabilities: ['write_content', 'edit', 'summarize', 'rewrite', 'format'],
    systemPrompt: `You are a professional content writer and editor. Your role is to:
1. Create engaging, well-structured content
2. Edit and improve existing text
3. Adapt tone and style to the target audience
4. Ensure clarity, coherence, and readability
5. Format content appropriately

When writing, focus on clarity, engagement, and purpose.`,
    modelPreference: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 4096,
  },

  analyst: {
    type: 'analyst',
    name: 'Analyst',
    description: 'Specialized in data analysis, visualization, and insights',
    capabilities: ['analyze_data', 'create_charts', 'find_patterns', 'compare', 'predict'],
    systemPrompt: `You are a data analyst. Your role is to:
1. Analyze datasets for patterns and insights
2. Create visualizations to communicate findings
3. Compare data across different dimensions
4. Identify trends and anomalies
5. Make data-driven recommendations

When analyzing, be thorough, objective, and insightful.`,
    modelPreference: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    maxTokens: 4096,
  },

  custom: {
    type: 'custom',
    name: 'Custom Agent',
    description: 'User-defined agent with custom capabilities and prompts',
    capabilities: ['custom_action'],
    systemPrompt: 'You are a helpful AI assistant.',
    temperature: 0.7,
    maxTokens: 2048,
  },
}

// ==================== AGENT ACTIONS ====================

export const AGENT_ACTIONS: Record<string, AgentAction> = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for information on a topic',
    inputSchema: {
      query: { type: 'string', required: true },
      maxResults: { type: 'number', default: 5 },
    },
    execute: async (input, context) => {
      // Integration with Groq web search tool
      const { performWebSearch } = await import('./web-search')
      const results = await performWebSearch(input.query, context.groqApiKey)
      return {
        success: true,
        query: input.query,
        results: results.slice(0, input.maxResults || 5),
      }
    },
  },

  summarize: {
    name: 'summarize',
    description: 'Summarize text or data into key points',
    inputSchema: {
      text: { type: 'string', required: true },
      maxLength: { type: 'number', default: 500 },
    },
    execute: async (input, context) => {
      // Use LLM to summarize
      const prompt = `Summarize the following text in ${input.maxLength || 500} words or less:\n\n${input.text}`
      return { success: true, summary: prompt } // Placeholder
    },
  },

  generate_code: {
    name: 'generate_code',
    description: 'Generate code based on requirements',
    inputSchema: {
      requirements: { type: 'string', required: true },
      language: { type: 'string', default: 'javascript' },
    },
    execute: async (input, context) => {
      const prompt = `Generate ${input.language} code for: ${input.requirements}`
      return { success: true, code: '', language: input.language }
    },
  },

  execute_code: {
    name: 'execute_code',
    description: 'Execute code and return the result',
    inputSchema: {
      code: { type: 'string', required: true },
      language: { type: 'string', default: 'javascript' },
    },
    execute: async (input, context) => {
      // Integration with E2B code execution
      const { executeCode } = await import('./code-executor')
      const result = await executeCode(input.code, input.language)
      return {
        success: !result.error,
        output: result.output,
        error: result.error,
      }
    },
  },

  write_content: {
    name: 'write_content',
    description: 'Write content based on a topic and style',
    inputSchema: {
      topic: { type: 'string', required: true },
      style: { type: 'string', default: 'professional' },
      length: { type: 'number', default: 500 },
    },
    execute: async (input, context) => {
      const prompt = `Write a ${input.style} article about ${input.topic} (approximately ${input.length} words)`
      return { success: true, content: '' }
    },
  },

  analyze_data: {
    name: 'analyze_data',
    description: 'Analyze a dataset and provide insights',
    inputSchema: {
      data: { type: 'any', required: true },
      analysisType: { type: 'string', default: 'general' },
    },
    execute: async (input, context) => {
      return {
        success: true,
        insights: [],
        summary: '',
      }
    },
  },

  custom_action: {
    name: 'custom_action',
    description: 'Custom user-defined action',
    inputSchema: {
      prompt: { type: 'string', required: true },
    },
    execute: async (input, context) => {
      return { success: true, result: '' }
    },
  },
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a new agent instance
 */
export function createAgent(type: AgentType, id?: string, customConfig?: Partial<Agent>): Agent {
  const definition = AGENT_DEFINITIONS[type]
  return {
    ...definition,
    id: id || `${type}-${Date.now()}`,
    ...customConfig,
  }
}

/**
 * Get available actions for an agent
 */
export function getAgentActions(agent: Agent): AgentAction[] {
  return agent.capabilities.map((cap) => AGENT_ACTIONS[cap]).filter(Boolean)
}

/**
 * Validate agent action input
 */
export function validateActionInput(action: AgentAction, input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const schema = action.inputSchema

  for (const [key, config] of Object.entries(schema)) {
    if ((config as any).required && !(key in input)) {
      errors.push(`Missing required field: ${key}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Execute an agent action
 */
export async function executeAgentAction(
  agent: Agent,
  actionName: string,
  input: any,
  context: WorkflowContext
): Promise<any> {
  const action = AGENT_ACTIONS[actionName]
  if (!action) {
    throw new Error(`Unknown action: ${actionName}`)
  }

  if (!agent.capabilities.includes(actionName)) {
    throw new Error(`Agent ${agent.name} does not support action: ${actionName}`)
  }

  const validation = validateActionInput(action, input)
  if (!validation.valid) {
    throw new Error(`Invalid input: ${validation.errors.join(', ')}`)
  }

  return await action.execute(input, context)
}
