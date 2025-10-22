/**
 * Workflow Execution Engine
 * Orchestrates multi-agent workflows with sequential, parallel, and conditional execution
 */

import { Agent, WorkflowContext, executeAgentAction } from './agents'
import { prisma } from './prisma'

export type ExecutionMode = 'sequential' | 'parallel' | 'conditional'
export type WorkflowStatus = 'running' | 'completed' | 'failed' | 'paused'

export interface WorkflowStep {
  id: string
  agent: string // Agent ID
  action: string // Action name
  input: string | WorkflowStepInput // Input source (static string or reference to previous step)
  output: string // Output variable name
  mode?: ExecutionMode // How to execute this step
  condition?: WorkflowCondition // For conditional execution
  parallel?: string[] // IDs of steps to run in parallel
  retryOnError?: boolean
  maxRetries?: number
}

export interface WorkflowStepInput {
  type: 'static' | 'variable' | 'step_output' | 'user_input'
  value: any
  stepId?: string // For step_output type
  variableName?: string // For variable type
}

export interface WorkflowCondition {
  type: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists'
  left: string // Variable or step output reference
  right: any // Value to compare against
  then: string // Step ID to execute if true
  else?: string // Step ID to execute if false
}

export interface WorkflowConfig {
  agents: Agent[]
  steps: WorkflowStep[]
  input?: Record<string, any> // User-provided input variables
  output?: string[] // Which variables to return as final output
}

export interface StepResult {
  stepId: string
  agent: string
  action: string
  input: any
  output: any
  error?: string
  duration: number
  timestamp: Date
}

export interface WorkflowResult {
  status: WorkflowStatus
  output: Record<string, any>
  stepResults: StepResult[]
  error?: string
  totalDuration: number
}

// ==================== WORKFLOW EXECUTION ENGINE ====================

export class WorkflowEngine {
  private context: WorkflowContext
  private config: WorkflowConfig
  private stepResults: StepResult[] = []
  private currentStepIndex = 0

  constructor(config: WorkflowConfig, context: WorkflowContext) {
    this.config = config
    this.context = {
      ...context,
      variables: { ...config.input },
      stepResults: {},
    }
  }

  /**
   * Execute the entire workflow
   */
  async execute(): Promise<WorkflowResult> {
    const startTime = Date.now()
    let status: WorkflowStatus = 'running'
    let error: string | undefined

    try {
      for (let i = 0; i < this.config.steps.length; i++) {
        this.currentStepIndex = i
        const step = this.config.steps[i]

        // Check if step should be skipped due to conditional logic
        if (step.condition && !this.evaluateCondition(step.condition)) {
          continue
        }

        // Execute step based on mode
        if (step.mode === 'parallel' && step.parallel) {
          await this.executeParallelSteps(step, step.parallel)
        } else {
          await this.executeStep(step)
        }
      }

      status = 'completed'
    } catch (err: any) {
      status = 'failed'
      error = err.message || 'Unknown error'
    }

    const totalDuration = Date.now() - startTime

    // Build final output
    const output: Record<string, any> = {}
    if (this.config.output) {
      for (const varName of this.config.output) {
        if (varName in this.context.variables) {
          output[varName] = this.context.variables[varName]
        } else if (varName in this.context.stepResults) {
          output[varName] = this.context.stepResults[varName]
        }
      }
    } else {
      // Return all variables if no specific output defined
      output = { ...this.context.variables, ...this.context.stepResults }
    }

    return {
      status,
      output,
      stepResults: this.stepResults,
      error,
      totalDuration,
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: WorkflowStep, retryCount = 0): Promise<void> {
    const startTime = Date.now()
    const agent = this.getAgent(step.agent)

    try {
      // Resolve input
      const input = this.resolveInput(step.input)

      // Execute action
      const output = await executeAgentAction(agent, step.action, input, this.context)

      // Store result
      const duration = Date.now() - startTime
      const result: StepResult = {
        stepId: step.id,
        agent: agent.name,
        action: step.action,
        input,
        output,
        duration,
        timestamp: new Date(),
      }

      this.stepResults.push(result)

      // Store output in context
      this.context.stepResults[step.id] = output
      if (step.output) {
        this.context.variables[step.output] = output
      }
    } catch (err: any) {
      const duration = Date.now() - startTime
      const result: StepResult = {
        stepId: step.id,
        agent: agent.name,
        action: step.action,
        input: this.resolveInput(step.input),
        output: null,
        error: err.message || 'Unknown error',
        duration,
        timestamp: new Date(),
      }

      this.stepResults.push(result)

      // Retry logic
      if (step.retryOnError && retryCount < (step.maxRetries || 3)) {
        console.log(`Retrying step ${step.id} (attempt ${retryCount + 1})...`)
        await this.executeStep(step, retryCount + 1)
      } else {
        throw err
      }
    }
  }

  /**
   * Execute multiple steps in parallel
   */
  private async executeParallelSteps(mainStep: WorkflowStep, stepIds: string[]): Promise<void> {
    const steps = stepIds
      .map((id) => this.config.steps.find((s) => s.id === id))
      .filter((s): s is WorkflowStep => s !== undefined)

    const promises = steps.map((step) => this.executeStep(step))
    await Promise.all(promises)
  }

  /**
   * Evaluate a conditional expression
   */
  private evaluateCondition(condition: WorkflowCondition): boolean {
    const leftValue = this.resolveReference(condition.left)
    const rightValue = condition.right

    switch (condition.type) {
      case 'equals':
        return leftValue === rightValue
      case 'contains':
        return String(leftValue).includes(String(rightValue))
      case 'greater_than':
        return Number(leftValue) > Number(rightValue)
      case 'less_than':
        return Number(leftValue) < Number(rightValue)
      case 'exists':
        return leftValue !== null && leftValue !== undefined
      default:
        return false
    }
  }

  /**
   * Resolve input value (static, variable, step output, or user input)
   */
  private resolveInput(input: string | WorkflowStepInput): any {
    if (typeof input === 'string') {
      // Simple string input - check if it's a reference
      return this.resolveReference(input)
    }

    switch (input.type) {
      case 'static':
        return input.value
      case 'variable':
        return input.variableName ? this.context.variables[input.variableName] : input.value
      case 'step_output':
        return input.stepId ? this.context.stepResults[input.stepId] : null
      case 'user_input':
        return input.variableName ? this.context.variables[input.variableName] : input.value
      default:
        return input.value
    }
  }

  /**
   * Resolve a reference like "{variable}" or "{step.output}"
   */
  private resolveReference(ref: string): any {
    // Check if it's a variable reference
    const varMatch = ref.match(/^\{(\w+)\}$/)
    if (varMatch) {
      const varName = varMatch[1]
      return this.context.variables[varName]
    }

    // Check if it's a step output reference
    const stepMatch = ref.match(/^\{([^.]+)\.(.+)\}$/)
    if (stepMatch) {
      const stepId = stepMatch[1]
      const property = stepMatch[2]
      const stepResult = this.context.stepResults[stepId]
      if (stepResult && typeof stepResult === 'object') {
        return (stepResult as any)[property]
      }
      return stepResult
    }

    // Return as-is if not a reference
    return ref
  }

  /**
   * Get agent by ID
   */
  private getAgent(agentId: string): Agent {
    const agent = this.config.agents.find((a) => a.id === agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }
    return agent
  }

  /**
   * Get current progress
   */
  getProgress(): { current: number; total: number; percentage: number } {
    const total = this.config.steps.length
    const current = this.stepResults.length
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0
    return { current, total, percentage }
  }
}

// ==================== DATABASE OPERATIONS ====================

/**
 * Save workflow run to database
 */
export async function saveWorkflowRun(
  workflowId: string,
  result: WorkflowResult,
  sessionId?: string
): Promise<string> {
  const workflowRun = await prisma.workflowRun.create({
    data: {
      workflowId,
      sessionId: sessionId || null,
      input: null,
      output: JSON.stringify(result.output),
      status: result.status,
      error: result.error || null,
      currentStep: result.stepResults.length,
      totalSteps: result.stepResults.length,
      stepResults: JSON.stringify(result.stepResults),
      completedAt: result.status === 'completed' ? new Date() : null,
    },
  })

  return workflowRun.id
}

/**
 * Update workflow run progress
 */
export async function updateWorkflowRun(
  runId: string,
  updates: {
    status?: WorkflowStatus
    currentStep?: number
    stepResults?: StepResult[]
    output?: Record<string, any>
    error?: string
  }
): Promise<void> {
  await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status: updates.status,
      currentStep: updates.currentStep,
      stepResults: updates.stepResults ? JSON.stringify(updates.stepResults) : undefined,
      output: updates.output ? JSON.stringify(updates.output) : undefined,
      error: updates.error,
      completedAt: updates.status === 'completed' ? new Date() : undefined,
    },
  })
}

/**
 * Get workflow run by ID
 */
export async function getWorkflowRun(runId: string) {
  const run = await prisma.workflowRun.findUnique({
    where: { id: runId },
    include: {
      workflow: true,
      session: true,
    },
  })

  if (!run) return null

  return {
    ...run,
    input: run.input ? JSON.parse(run.input) : null,
    output: run.output ? JSON.parse(run.output) : null,
    stepResults: run.stepResults ? JSON.parse(run.stepResults) : [],
  }
}

// ==================== WORKFLOW TEMPLATES ====================

export const WORKFLOW_TEMPLATES: Record<string, WorkflowConfig> = {
  'research-and-report': {
    agents: [
      {
        id: 'researcher-1',
        type: 'researcher',
        name: 'Researcher',
        description: 'Web search and data gathering',
        capabilities: ['web_search', 'summarize'],
        systemPrompt: 'You are a research specialist.',
      },
      {
        id: 'writer-1',
        type: 'writer',
        name: 'Writer',
        description: 'Report writing',
        capabilities: ['write_content'],
        systemPrompt: 'You are a professional writer.',
      },
    ],
    steps: [
      {
        id: 'step1',
        agent: 'researcher-1',
        action: 'web_search',
        input: {
          type: 'user_input',
          variableName: 'topic',
          value: '',
        },
        output: 'searchResults',
      },
      {
        id: 'step2',
        agent: 'researcher-1',
        action: 'summarize',
        input: {
          type: 'step_output',
          stepId: 'step1',
          value: '',
        },
        output: 'summary',
      },
      {
        id: 'step3',
        agent: 'writer-1',
        action: 'write_content',
        input: {
          type: 'step_output',
          stepId: 'step2',
          value: '',
        },
        output: 'report',
      },
    ],
    output: ['report', 'summary', 'searchResults'],
  },

  'code-and-test': {
    agents: [
      {
        id: 'coder-1',
        type: 'coder',
        name: 'Coder',
        description: 'Code generation and execution',
        capabilities: ['generate_code', 'execute_code', 'debug'],
        systemPrompt: 'You are an expert software engineer.',
      },
    ],
    steps: [
      {
        id: 'step1',
        agent: 'coder-1',
        action: 'generate_code',
        input: {
          type: 'user_input',
          variableName: 'requirements',
          value: '',
        },
        output: 'code',
      },
      {
        id: 'step2',
        agent: 'coder-1',
        action: 'execute_code',
        input: {
          type: 'step_output',
          stepId: 'step1',
          value: '',
        },
        output: 'executionResult',
        retryOnError: true,
        maxRetries: 3,
      },
    ],
    output: ['code', 'executionResult'],
  },

  'analyze-and-visualize': {
    agents: [
      {
        id: 'analyst-1',
        type: 'analyst',
        name: 'Analyst',
        description: 'Data analysis',
        capabilities: ['analyze_data'],
        systemPrompt: 'You are a data analyst.',
      },
      {
        id: 'writer-1',
        type: 'writer',
        name: 'Writer',
        description: 'Report writing',
        capabilities: ['write_content', 'summarize'],
        systemPrompt: 'You are a professional writer.',
      },
    ],
    steps: [
      {
        id: 'step1',
        agent: 'analyst-1',
        action: 'analyze_data',
        input: {
          type: 'user_input',
          variableName: 'data',
          value: '',
        },
        output: 'analysis',
      },
      {
        id: 'step2',
        agent: 'writer-1',
        action: 'summarize',
        input: {
          type: 'step_output',
          stepId: 'step1',
          value: '',
        },
        output: 'summary',
      },
    ],
    output: ['analysis', 'summary'],
  },
}

/**
 * Get workflow template by name
 */
export function getWorkflowTemplate(name: string): WorkflowConfig | null {
  return WORKFLOW_TEMPLATES[name] || null
}

/**
 * List all workflow templates
 */
export function listWorkflowTemplates(): Array<{ name: string; description: string; category: string }> {
  return [
    {
      name: 'research-and-report',
      description: 'Research a topic, summarize findings, and write a comprehensive report',
      category: 'Research',
    },
    {
      name: 'code-and-test',
      description: 'Generate code based on requirements, then execute and test it',
      category: 'Code',
    },
    {
      name: 'analyze-and-visualize',
      description: 'Analyze data, find insights, and create a summary report',
      category: 'Analysis',
    },
  ]
}
