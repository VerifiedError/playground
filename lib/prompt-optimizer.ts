/**
 * Prompt Optimizer
 *
 * Analyze and optimize prompts using prompt engineering best practices.
 * Provides suggestions for clarity, specificity, structure, and effectiveness.
 */

export interface OptimizationSuggestion {
  type: 'clarity' | 'specificity' | 'structure' | 'context' | 'format' | 'tone' | 'examples'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  example?: string
}

export interface OptimizationResult {
  score: number // 0-100
  suggestions: OptimizationSuggestion[]
  optimizedPrompt?: string
  analysis: {
    clarity: number // 0-100
    specificity: number // 0-100
    structure: number // 0-100
    context: number // 0-100
    wordCount: number
    hasRole: boolean
    hasTask: boolean
    hasFormat: boolean
    hasExamples: boolean
    hasTone: boolean
  }
}

/**
 * Analyze and optimize a prompt
 */
export function analyzePrompt(prompt: string): OptimizationResult {
  const suggestions: OptimizationSuggestion[] = []
  const analysis = {
    clarity: 0,
    specificity: 0,
    structure: 0,
    context: 0,
    wordCount: 0,
    hasRole: false,
    hasTask: false,
    hasFormat: false,
    hasExamples: false,
    hasTone: false,
  }

  // Basic analysis
  const trimmed = prompt.trim()
  const words = trimmed.split(/\s+/)
  analysis.wordCount = words.length

  // Check for role definition
  const rolePatterns = [
    /you are (a|an) /i,
    /act as (a|an) /i,
    /imagine you are/i,
    /as (a|an) /i,
  ]
  analysis.hasRole = rolePatterns.some((pattern) => pattern.test(trimmed))

  // Check for clear task
  const taskPatterns = [
    /write /i,
    /create /i,
    /generate /i,
    /analyze /i,
    /explain /i,
    /summarize /i,
    /review /i,
    /design /i,
  ]
  analysis.hasTask = taskPatterns.some((pattern) => pattern.test(trimmed))

  // Check for format specification
  const formatPatterns = [
    /format:/i,
    /in the following format/i,
    /structure:/i,
    /bullet points/i,
    /numbered list/i,
    /paragraph/i,
    /markdown/i,
    /json/i,
  ]
  analysis.hasFormat = formatPatterns.some((pattern) => pattern.test(trimmed))

  // Check for examples
  const examplePatterns = [
    /example:/i,
    /for example/i,
    /such as/i,
    /like this:/i,
    /e\.g\./i,
  ]
  analysis.hasExamples = examplePatterns.some((pattern) => pattern.test(trimmed))

  // Check for tone specification
  const tonePatterns = [
    /tone:/i,
    /professional/i,
    /casual/i,
    /formal/i,
    /friendly/i,
    /enthusiastic/i,
    /conversational/i,
  ]
  analysis.hasTone = tonePatterns.some((pattern) => pattern.test(trimmed))

  // === CLARITY CHECKS ===
  let clarityScore = 50 // Base score

  // Too vague?
  if (analysis.wordCount < 10) {
    suggestions.push({
      type: 'clarity',
      severity: 'high',
      message: 'Prompt is too short and vague',
      suggestion: 'Expand your prompt with more details about what you want. Aim for at least 20-30 words.',
      example: 'Instead of "Write code", try "Write a Python function that validates email addresses using regex, including error handling and unit tests."',
    })
    clarityScore -= 30
  } else {
    clarityScore += 10
  }

  // Overly complex?
  if (analysis.wordCount > 300) {
    suggestions.push({
      type: 'clarity',
      severity: 'medium',
      message: 'Prompt may be overly long',
      suggestion: 'Consider breaking down complex prompts into focused sections with clear headings.',
      example: 'Use sections like "Context:", "Task:", "Requirements:", and "Output Format:" to organize long prompts.',
    })
    clarityScore -= 10
  }

  // Unclear instructions?
  const ambiguousWords = ['something', 'anything', 'stuff', 'things', 'maybe', 'kinda', 'sorta']
  const hasAmbiguous = ambiguousWords.some((word) =>
    trimmed.toLowerCase().includes(word)
  )
  if (hasAmbiguous) {
    suggestions.push({
      type: 'clarity',
      severity: 'medium',
      message: 'Prompt contains vague language',
      suggestion: 'Replace ambiguous words with specific terms. Be precise about what you want.',
      example: 'Instead of "something about marketing", say "a 500-word blog post about social media marketing strategies for small businesses".',
    })
    clarityScore -= 15
  }

  analysis.clarity = Math.max(0, Math.min(100, clarityScore))

  // === SPECIFICITY CHECKS ===
  let specificityScore = 50

  // Missing role?
  if (!analysis.hasRole) {
    suggestions.push({
      type: 'specificity',
      severity: 'medium',
      message: 'No role definition found',
      suggestion: 'Define a specific role or persona for the AI to adopt. This improves response quality.',
      example: 'Start with "You are an expert Python developer..." or "Act as a marketing consultant..."',
    })
    specificityScore -= 20
  } else {
    specificityScore += 15
  }

  // Missing task?
  if (!analysis.hasTask) {
    suggestions.push({
      type: 'specificity',
      severity: 'high',
      message: 'No clear task or action verb found',
      suggestion: 'Start with a clear action verb (write, create, analyze, explain, etc.) to define what you want.',
      example: 'Instead of "I need help with code", say "Review this Python code for bugs and performance issues".',
    })
    specificityScore -= 25
  } else {
    specificityScore += 20
  }

  // Missing constraints?
  const constraintPatterns = [
    /\d+ words/i,
    /\d+ paragraphs/i,
    /within \d+/i,
    /maximum/i,
    /minimum/i,
    /at least/i,
    /no more than/i,
  ]
  const hasConstraints = constraintPatterns.some((pattern) => pattern.test(trimmed))
  if (!hasConstraints && analysis.wordCount > 20) {
    suggestions.push({
      type: 'specificity',
      severity: 'low',
      message: 'No length or scope constraints specified',
      suggestion: 'Add specific constraints (word count, time limit, scope) to guide the response.',
      example: 'Add "in 200-300 words" or "using only Python standard library" to set boundaries.',
    })
    specificityScore -= 10
  } else if (hasConstraints) {
    specificityScore += 15
  }

  analysis.specificity = Math.max(0, Math.min(100, specificityScore))

  // === STRUCTURE CHECKS ===
  let structureScore = 50

  // Missing format?
  if (!analysis.hasFormat && analysis.wordCount > 30) {
    suggestions.push({
      type: 'structure',
      severity: 'medium',
      message: 'No output format specified',
      suggestion: 'Specify the desired output format (bullet points, numbered list, markdown, JSON, etc.).',
      example: 'Add "Format your response as:\n1. Summary\n2. Detailed analysis\n3. Recommendations"',
    })
    structureScore -= 15
  } else if (analysis.hasFormat) {
    structureScore += 20
  }

  // Check for numbered/bulleted structure
  const hasNumbering = /\d+\./g.test(trimmed) || /^[-•*]/gm.test(trimmed)
  if (hasNumbering) {
    structureScore += 15
  } else if (analysis.wordCount > 50) {
    suggestions.push({
      type: 'structure',
      severity: 'low',
      message: 'Consider using numbered or bulleted lists',
      suggestion: 'Break down complex requests into numbered steps or bullet points for clarity.',
      example: 'Format as:\n1. First requirement\n2. Second requirement\n3. Third requirement',
    })
    structureScore -= 10
  }

  // Check for section headers
  const hasSections = /^#+\s/gm.test(trimmed) || /^[A-Z][a-z]+:/gm.test(trimmed)
  if (hasSections) {
    structureScore += 15
  }

  analysis.structure = Math.max(0, Math.min(100, structureScore))

  // === CONTEXT CHECKS ===
  let contextScore = 50

  // Missing tone?
  if (!analysis.hasTone && analysis.wordCount > 20) {
    suggestions.push({
      type: 'tone',
      severity: 'low',
      message: 'No tone specified',
      suggestion: 'Specify the desired tone (professional, casual, technical, friendly, etc.).',
      example: 'Add "Use a professional tone" or "Write in a conversational style".',
    })
    contextScore -= 10
  } else if (analysis.hasTone) {
    contextScore += 15
  }

  // Missing examples?
  if (!analysis.hasExamples && analysis.wordCount > 40) {
    suggestions.push({
      type: 'examples',
      severity: 'low',
      message: 'No examples provided',
      suggestion: 'Include examples to clarify your expectations (few-shot prompting).',
      example: 'Add "For example: Input: [sample] → Output: [expected result]"',
    })
    contextScore -= 10
  } else if (analysis.hasExamples) {
    contextScore += 20
  }

  // Check for audience specification
  const audiencePatterns = [
    /audience:/i,
    /for (beginners|experts|students|professionals)/i,
    /target audience/i,
  ]
  const hasAudience = audiencePatterns.some((pattern) => pattern.test(trimmed))
  if (hasAudience) {
    contextScore += 15
  }

  analysis.context = Math.max(0, Math.min(100, contextScore))

  // === CALCULATE OVERALL SCORE ===
  const overallScore = Math.round(
    (analysis.clarity * 0.3 +
      analysis.specificity * 0.3 +
      analysis.structure * 0.2 +
      analysis.context * 0.2)
  )

  // === GENERATE OPTIMIZED PROMPT (if score is low) ===
  let optimizedPrompt: string | undefined
  if (overallScore < 70) {
    optimizedPrompt = generateOptimizedPrompt(trimmed, analysis)
  }

  return {
    score: overallScore,
    suggestions,
    optimizedPrompt,
    analysis,
  }
}

/**
 * Generate an optimized version of a prompt
 */
function generateOptimizedPrompt(
  originalPrompt: string,
  analysis: OptimizationResult['analysis']
): string {
  let optimized = originalPrompt

  // Add role if missing
  if (!analysis.hasRole) {
    optimized = `You are an expert assistant.\n\n${optimized}`
  }

  // Add structure if missing
  if (!analysis.hasFormat && !analysis.hasTask) {
    optimized += `\n\nProvide a well-structured response with clear sections.`
  }

  // Add format guidance
  if (!analysis.hasFormat) {
    optimized += `\n\nFormat your response with:
1. Summary
2. Detailed explanation
3. Examples (if applicable)
4. Recommendations or next steps`
  }

  return optimized
}

/**
 * Get optimization tips based on prompt type
 */
export function getOptimizationTips(promptType?: string): string[] {
  const generalTips = [
    'Start with a clear role: "You are a [role]..."',
    'Use specific action verbs: write, create, analyze, explain, etc.',
    'Define the output format: bullet points, numbered list, JSON, etc.',
    'Specify constraints: word count, time limit, scope',
    'Include examples to clarify expectations (few-shot prompting)',
    'Set the tone: professional, casual, technical, friendly',
    'Provide context: background information, target audience',
    'Use numbered lists for multi-step tasks',
    'Break complex prompts into clear sections with headers',
    'Avoid vague language: "something", "stuff", "things"',
  ]

  const codingTips = [
    'Specify programming language and version',
    'Define input/output format clearly',
    'Mention framework or library constraints',
    'Request code comments and documentation',
    'Ask for error handling and edge cases',
    'Specify coding style (PEP 8, Airbnb, etc.)',
  ]

  const writingTips = [
    'Define target audience and reading level',
    'Specify word count or length range',
    'Set tone and style guidelines',
    'Mention SEO keywords if applicable',
    'Request specific structure (intro, body, conclusion)',
    'Include call-to-action requirements',
  ]

  if (promptType === 'coding') {
    return [...generalTips, ...codingTips]
  } else if (promptType === 'writing') {
    return [...generalTips, ...writingTips]
  }

  return generalTips
}

/**
 * Compare two prompts (A/B testing)
 */
export interface ComparisonResult {
  promptA: OptimizationResult
  promptB: OptimizationResult
  winner: 'A' | 'B' | 'tie'
  scoreDifference: number
  recommendation: string
}

export function comparePrompts(promptA: string, promptB: string): ComparisonResult {
  const resultA = analyzePrompt(promptA)
  const resultB = analyzePrompt(promptB)

  const scoreDifference = Math.abs(resultA.score - resultB.score)

  let winner: 'A' | 'B' | 'tie' = 'tie'
  if (scoreDifference > 5) {
    winner = resultA.score > resultB.score ? 'A' : 'B'
  }

  let recommendation = ''
  if (winner === 'tie') {
    recommendation = 'Both prompts are similar in quality. Consider combining strengths from both.'
  } else if (winner === 'A') {
    recommendation = `Prompt A is stronger. It excels in: ${getBestAspects(resultA).join(', ')}.`
  } else {
    recommendation = `Prompt B is stronger. It excels in: ${getBestAspects(resultB).join(', ')}.`
  }

  return {
    promptA: resultA,
    promptB: resultB,
    winner,
    scoreDifference,
    recommendation,
  }
}

/**
 * Get the best aspects of a prompt analysis
 */
function getBestAspects(result: OptimizationResult): string[] {
  const aspects: string[] = []
  const { analysis } = result

  if (analysis.clarity >= 70) aspects.push('clarity')
  if (analysis.specificity >= 70) aspects.push('specificity')
  if (analysis.structure >= 70) aspects.push('structure')
  if (analysis.context >= 70) aspects.push('context')

  return aspects.length > 0 ? aspects : ['overall quality']
}

/**
 * Apply prompt engineering frameworks
 */
export interface FrameworkTemplate {
  name: string
  description: string
  structure: string[]
  example: string
}

export const PROMPT_FRAMEWORKS: Record<string, FrameworkTemplate> = {
  CRISPE: {
    name: 'CRISPE Framework',
    description: 'Capacity, Role, Insight, Statement, Personality, Experiment',
    structure: [
      'Capacity: Define the AI\'s capacity/role',
      'Role: Specify the perspective to adopt',
      'Insight: Provide background context',
      'Statement: State the task clearly',
      'Personality: Set the tone/style',
      'Experiment: Request specific output format',
    ],
    example: `Capacity: You are an expert Python developer
Role: Act as a code reviewer
Insight: We follow PEP 8 and prioritize readability
Statement: Review this function for bugs and improvements
Personality: Be constructive and educational
Experiment: Provide a markdown report with specific line numbers`,
  },

  RISEN: {
    name: 'RISEN Framework',
    description: 'Role, Instructions, Steps, End goal, Narrowing',
    structure: [
      'Role: Define who the AI is',
      'Instructions: What to do',
      'Steps: How to do it',
      'End goal: Desired outcome',
      'Narrowing: Constraints and specifics',
    ],
    example: `Role: You are a content marketing strategist
Instructions: Create a blog post outline
Steps: 1) Research topic, 2) Identify key points, 3) Structure with headers
End goal: SEO-optimized outline ready for writing
Narrowing: 1000-1500 words, target audience is small business owners`,
  },

  TREE: {
    name: 'TREE Framework',
    description: 'Task, Requirements, Expectations, Example',
    structure: [
      'Task: What needs to be done',
      'Requirements: Specific constraints',
      'Expectations: Quality standards',
      'Example: Sample input/output',
    ],
    example: `Task: Translate English to Spanish
Requirements: Formal tone, business context
Expectations: Culturally appropriate, accurate grammar
Example: "Hello, how are you?" → "Hola, ¿cómo está usted?"`,
  },
}

/**
 * Apply a framework to a user's prompt
 */
export function applyFramework(prompt: string, framework: keyof typeof PROMPT_FRAMEWORKS): string {
  const fw = PROMPT_FRAMEWORKS[framework]
  return `Using the ${fw.name}:\n\n${fw.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nYour prompt:\n${prompt}\n\nSuggested structure:\n${fw.example}`
}
