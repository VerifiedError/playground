/**
 * Prompt Templates Library
 *
 * Built-in prompt templates for common tasks.
 * Users can also create custom templates and save them to the database.
 */

export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: 'Developer' | 'Writer' | 'Analyst' | 'Business' | 'Creative' | 'Education' | 'Research' | 'Other'
  template: string
  variables: string[]
  tags: string[]
  isBuiltIn: boolean
}

/**
 * Built-in prompt templates (10+ templates)
 */
export const BUILT_IN_TEMPLATES: PromptTemplate[] = [
  // ==================== DEVELOPER CATEGORY ====================
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Comprehensive code review with best practices, bugs, and performance analysis',
    category: 'Developer',
    template: `You are an expert code reviewer with deep knowledge of software engineering best practices.

Review the following code for:
1. **Bugs & Logic Errors** - Identify potential runtime errors or logical mistakes
2. **Performance Issues** - Highlight inefficiencies and suggest optimizations
3. **Security Vulnerabilities** - Check for common security flaws (SQL injection, XSS, etc.)
4. **Best Practices** - Ensure adherence to coding standards and design patterns
5. **Code Readability** - Suggest improvements for clarity and maintainability

Code:
\`\`\`{language}
{code}
\`\`\`

Provide detailed feedback with specific line numbers and actionable suggestions.`,
    variables: ['language', 'code'],
    tags: ['code', 'review', 'debugging', 'best-practices'],
    isBuiltIn: true,
  },

  {
    id: 'debugger-assistant',
    name: 'Debugger Assistant',
    description: 'Step-by-step debugging help for error analysis and resolution',
    category: 'Developer',
    template: `You are a debugging expert. Help me diagnose and fix this error.

**Error Message:**
{error}

**Code Context:**
\`\`\`{language}
{code}
\`\`\`

**Environment:**
{environment}

Please:
1. Explain what the error means
2. Identify the root cause
3. Provide step-by-step fix instructions
4. Suggest how to prevent similar errors in the future`,
    variables: ['error', 'language', 'code', 'environment'],
    tags: ['debugging', 'error-fixing', 'troubleshooting'],
    isBuiltIn: true,
  },

  {
    id: 'api-designer',
    name: 'API Designer',
    description: 'Design RESTful or GraphQL APIs with proper endpoints and schemas',
    category: 'Developer',
    template: `You are an API design expert. Design a {api_type} API for: {description}

Requirements:
- Endpoint structure (REST) or schema (GraphQL)
- Request/response formats
- Authentication/authorization approach
- Error handling
- Rate limiting considerations
- Versioning strategy

Follow best practices for {api_type} design and provide OpenAPI/GraphQL schema documentation.`,
    variables: ['api_type', 'description'],
    tags: ['api', 'design', 'rest', 'graphql', 'backend'],
    isBuiltIn: true,
  },

  // ==================== WRITER CATEGORY ====================
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Professional content writing with SEO optimization',
    category: 'Writer',
    template: `You are a professional content writer specializing in {content_type} content.

Write engaging, well-researched content about: {topic}

Requirements:
- Target audience: {audience}
- Tone: {tone}
- Word count: {word_count} words
- Include relevant examples and statistics
- Optimize for SEO with natural keyword usage
- Use compelling headlines and subheadings
- End with a clear call-to-action

Make the content informative, engaging, and actionable.`,
    variables: ['content_type', 'topic', 'audience', 'tone', 'word_count'],
    tags: ['writing', 'content', 'seo', 'blog', 'copywriting'],
    isBuiltIn: true,
  },

  {
    id: 'copywriter',
    name: 'Copywriter',
    description: 'Persuasive marketing copy for ads, emails, and landing pages',
    category: 'Business',
    template: `You are a direct-response copywriter. Create compelling copy for: {copy_type}

Product/Service: {product}
Target Audience: {audience}
Key Benefit: {benefit}
Desired Action: {cta}

Use proven copywriting frameworks (AIDA, PAS, FAB) to craft persuasive copy that:
- Grabs attention immediately
- Highlights benefits over features
- Addresses pain points
- Creates urgency
- Drives conversion

Tone: {tone}`,
    variables: ['copy_type', 'product', 'audience', 'benefit', 'cta', 'tone'],
    tags: ['copywriting', 'marketing', 'sales', 'persuasion', 'conversion'],
    isBuiltIn: true,
  },

  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Fiction, poetry, and creative storytelling',
    category: 'Creative',
    template: `You are a creative writer specializing in {genre}.

Write a {format} about: {premise}

Style Guidelines:
- Tone: {tone}
- Point of View: {pov}
- Target Length: {length} words
- Include vivid descriptions and sensory details
- Develop compelling characters with depth
- Create engaging dialogue
- Build narrative tension

Make the writing immersive and emotionally resonant.`,
    variables: ['genre', 'format', 'premise', 'tone', 'pov', 'length'],
    tags: ['creative-writing', 'fiction', 'storytelling', 'narrative'],
    isBuiltIn: true,
  },

  // ==================== ANALYST CATEGORY ====================
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze data, identify trends, and provide actionable insights',
    category: 'Analyst',
    template: `You are a data analyst. Analyze the following data and provide insights:

**Dataset:**
{data}

**Analysis Goals:**
{goals}

Please:
1. **Summary Statistics** - Calculate key metrics (mean, median, mode, std dev)
2. **Trends & Patterns** - Identify significant trends and correlations
3. **Anomalies** - Highlight outliers and unusual patterns
4. **Insights** - Provide actionable business insights
5. **Recommendations** - Suggest data-driven actions
6. **Visualizations** - Recommend appropriate chart types

Format your response with clear sections and use tables where appropriate.`,
    variables: ['data', 'goals'],
    tags: ['data-analysis', 'statistics', 'insights', 'business-intelligence'],
    isBuiltIn: true,
  },

  {
    id: 'competitive-analyst',
    name: 'Competitive Analyst',
    description: 'Analyze competitors and market positioning',
    category: 'Business',
    template: `You are a competitive intelligence analyst. Analyze the competitive landscape for: {company}

**Industry:** {industry}
**Key Competitors:** {competitors}
**Analysis Focus:** {focus}

Provide:
1. **Market Position** - Current standing vs competitors
2. **Strengths & Weaknesses** - SWOT analysis
3. **Competitive Advantages** - Unique differentiators
4. **Threats & Opportunities** - Market dynamics
5. **Strategic Recommendations** - Actionable next steps

Use frameworks like Porter's Five Forces and Value Chain Analysis where relevant.`,
    variables: ['company', 'industry', 'competitors', 'focus'],
    tags: ['competitive-analysis', 'business-strategy', 'market-research', 'swot'],
    isBuiltIn: true,
  },

  // ==================== EDUCATION CATEGORY ====================
  {
    id: 'teacher-explainer',
    name: 'Teacher & Explainer',
    description: 'Explain complex concepts in simple, easy-to-understand language',
    category: 'Education',
    template: `You are a skilled educator. Explain the concept of {concept} to someone with {knowledge_level} knowledge.

Use the following approach:
1. **Simple Definition** - Start with a clear, jargon-free explanation
2. **Real-World Analogy** - Use relatable comparisons
3. **Key Components** - Break down the main parts
4. **Examples** - Provide concrete examples
5. **Common Misconceptions** - Address frequent misunderstandings
6. **Practice Questions** - Include 2-3 questions to test understanding

Tone: {tone} (e.g., friendly, formal, enthusiastic)
Target Age Group: {age_group}`,
    variables: ['concept', 'knowledge_level', 'tone', 'age_group'],
    tags: ['education', 'teaching', 'explanation', 'learning', 'eli5'],
    isBuiltIn: true,
  },

  {
    id: 'study-guide',
    name: 'Study Guide Creator',
    description: 'Create comprehensive study guides from course materials',
    category: 'Education',
    template: `You are an educational consultant. Create a study guide for: {subject}

**Course Material:**
{material}

**Exam Date:** {exam_date}
**Study Time Available:** {study_time}

Create a structured study guide with:
1. **Key Concepts** - Main topics and subtopics
2. **Learning Objectives** - What students should master
3. **Summary Notes** - Condensed explanations
4. **Important Formulas/Definitions** - Quick reference
5. **Practice Questions** - Sample problems with solutions
6. **Study Schedule** - Time-boxed study plan
7. **Memory Aids** - Mnemonics and visualization techniques`,
    variables: ['subject', 'material', 'exam_date', 'study_time'],
    tags: ['education', 'studying', 'exam-prep', 'learning'],
    isBuiltIn: true,
  },

  // ==================== RESEARCH CATEGORY ====================
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Literature review and research synthesis',
    category: 'Research',
    template: `You are a research assistant. Conduct a literature review on: {research_topic}

**Research Question:** {research_question}
**Discipline:** {discipline}
**Sources Provided:** {sources}

Provide:
1. **Introduction** - Context and significance
2. **Methodology** - Research approach and criteria
3. **Key Findings** - Synthesize main discoveries from sources
4. **Themes & Patterns** - Common threads across studies
5. **Gaps & Limitations** - What's missing or needs further research
6. **Conclusions** - Summary and implications
7. **References** - Properly formatted citations (APA/MLA/Chicago)

Maintain academic rigor and objectivity throughout.`,
    variables: ['research_topic', 'research_question', 'discipline', 'sources'],
    tags: ['research', 'literature-review', 'academic', 'synthesis'],
    isBuiltIn: true,
  },

  // ==================== UTILITY TEMPLATES ====================
  {
    id: 'summarizer',
    name: 'Summarizer',
    description: 'Condense long texts into concise summaries',
    category: 'Other',
    template: `You are a professional summarizer. Create a {summary_type} summary of the following text:

**Original Text:**
{text}

**Summary Requirements:**
- Length: {length} (e.g., 100 words, 1 paragraph, 3 bullet points)
- Focus: {focus} (e.g., key points, action items, main argument)
- Tone: {tone}

Ensure the summary captures the essence while maintaining accuracy and clarity.`,
    variables: ['summary_type', 'text', 'length', 'focus', 'tone'],
    tags: ['summarization', 'condensing', 'tldr', 'brevity'],
    isBuiltIn: true,
  },

  {
    id: 'translator',
    name: 'Translator',
    description: 'Translate text between languages with cultural context',
    category: 'Other',
    template: `You are a professional translator specializing in {source_language} to {target_language} translation.

**Text to Translate:**
{text}

**Context:** {context}
**Tone:** {tone}

Provide:
1. **Direct Translation** - Accurate word-for-word translation
2. **Natural Translation** - Idiomatic, culturally appropriate version
3. **Notes** - Explain any cultural nuances or idioms
4. **Alternative Phrasings** - If multiple interpretations exist

Ensure the translation preserves the original meaning and tone.`,
    variables: ['source_language', 'target_language', 'text', 'context', 'tone'],
    tags: ['translation', 'language', 'localization', 'multilingual'],
    isBuiltIn: true,
  },

  {
    id: 'brainstormer',
    name: 'Brainstormer',
    description: 'Generate creative ideas and solutions',
    category: 'Creative',
    template: `You are a creative brainstorming facilitator. Generate ideas for: {topic}

**Context:** {context}
**Goals:** {goals}
**Constraints:** {constraints}

Use the following brainstorming techniques:
1. **Lateral Thinking** - Unconventional approaches
2. **SCAMPER** - Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse
3. **Mind Mapping** - Connected concepts and themes
4. **First Principles** - Break down to fundamental truths

Generate at least 10 diverse ideas, ranging from practical to wild. For each idea:
- Brief description
- Pros and cons
- Feasibility rating (1-10)
- Next steps to explore`,
    variables: ['topic', 'context', 'goals', 'constraints'],
    tags: ['brainstorming', 'ideation', 'creativity', 'innovation'],
    isBuiltIn: true,
  },

  // ==================== CHAIN-OF-THOUGHT TEMPLATE ====================
  {
    id: 'chain-of-thought-problem-solver',
    name: 'Chain-of-Thought Problem Solver',
    description: 'Solve complex problems with step-by-step reasoning',
    category: 'Analyst',
    template: `You are a systematic problem solver. Solve the following problem using chain-of-thought reasoning:

**Problem:**
{problem}

**Given Information:**
{given_info}

Use step-by-step reasoning:
1. **Understand** - Restate the problem in your own words
2. **Plan** - Outline your approach and what you need to find
3. **Execute** - Work through the solution step-by-step, showing all work
4. **Verify** - Check your answer for reasonableness
5. **Explain** - Describe why this solution works

Think through each step carefully and show your reasoning process clearly.`,
    variables: ['problem', 'given_info'],
    tags: ['problem-solving', 'reasoning', 'chain-of-thought', 'logic'],
    isBuiltIn: true,
  },
]

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((template) => template.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return BUILT_IN_TEMPLATES.filter((template) => template.category === category)
}

/**
 * Get all unique categories
 */
export function getCategories(): PromptTemplate['category'][] {
  const categories = new Set(BUILT_IN_TEMPLATES.map((t) => t.category))
  return Array.from(categories)
}

/**
 * Search templates by name, description, or tags
 */
export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase()
  return BUILT_IN_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Substitute variables in a template
 */
export function substituteVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  // Replace {variable} with values
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}

/**
 * Extract variable names from a template string
 */
export function extractVariables(template: string): string[] {
  const regex = /\{([^}]+)\}/g
  const matches = [...template.matchAll(regex)]
  return [...new Set(matches.map((m) => m[1]))]
}
