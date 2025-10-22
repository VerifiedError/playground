/**
 * Session Export & Import Utilities
 * Export/import sessions as JSON or Markdown for backup, sharing, or documentation
 */

import { Session, Message } from '@/stores/agentic-session-store'

/**
 * Exported session data structure
 */
export interface ExportedSession {
  version: string
  exportedAt: string
  session: {
    id: string
    name: string
    model: string
    createdAt: string
    updatedAt: string
    totalCost: number
    totalTokens: number
    messageCount: number
    messages: Array<{
      id: string
      role: 'user' | 'assistant' | 'system'
      content: string
      reasoning?: string
      images?: string[]
      timestamp?: string
      cost?: number
      inputTokens?: number
      outputTokens?: number
      cachedTokens?: number
    }>
  }
}

/**
 * Export session as JSON with all metadata
 */
export function exportSessionAsJSON(session: Session): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    session: {
      id: session.id,
      name: session.name,
      model: session.model,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      totalCost: session.totalCost,
      totalTokens: session.totalTokens,
      messageCount: session.messages.length,
      messages: session.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        reasoning: message.reasoning,
        images: message.images,
        timestamp: message.timestamp?.toISOString(),
        cost: message.cost,
        inputTokens: message.inputTokens,
        outputTokens: message.outputTokens,
        cachedTokens: message.cachedTokens,
      })),
    },
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export session as Markdown with readable formatting
 */
export function exportSessionAsMarkdown(session: Session): string {
  const lines: string[] = []

  // Header
  lines.push(`# ${session.name}`)
  lines.push('')
  lines.push(`**Model:** ${session.model}`)
  lines.push(`**Created:** ${session.createdAt.toLocaleString()}`)
  lines.push(`**Messages:** ${session.messages.length}`)
  lines.push(`**Total Cost:** $${session.totalCost.toFixed(4)}`)
  lines.push(`**Total Tokens:** ${session.totalTokens.toLocaleString()}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Messages
  for (const message of session.messages) {
    // Message header
    const role = message.role === 'user' ? '👤 User' : '🤖 Assistant'
    const timestamp = message.timestamp
      ? ` • ${message.timestamp.toLocaleTimeString()}`
      : ''
    const cost =
      message.role === 'assistant' && message.cost
        ? ` • $${message.cost.toFixed(4)}`
        : ''

    lines.push(`## ${role}${timestamp}${cost}`)
    lines.push('')

    // Reasoning (if present)
    if (message.reasoning && message.role === 'assistant') {
      lines.push('**Reasoning:**')
      lines.push('')
      lines.push('> ' + message.reasoning.split('\n').join('\n> '))
      lines.push('')
    }

    // Images (if present)
    if (message.images && message.images.length > 0) {
      lines.push('**Attached Images:**')
      for (let i = 0; i < message.images.length; i++) {
        lines.push(`- Image ${i + 1}: \`[base64 data]\``)
      }
      lines.push('')
    }

    // Message content
    lines.push(message.content)
    lines.push('')

    // Token info (for assistant messages)
    if (message.role === 'assistant' && message.inputTokens !== undefined) {
      const tokenInfo = []
      if (message.inputTokens) tokenInfo.push(`Input: ${message.inputTokens}`)
      if (message.outputTokens) tokenInfo.push(`Output: ${message.outputTokens}`)
      if (message.cachedTokens) tokenInfo.push(`Cached: ${message.cachedTokens}`)

      if (tokenInfo.length > 0) {
        lines.push(`*Tokens: ${tokenInfo.join(', ')}*`)
        lines.push('')
      }
    }

    lines.push('---')
    lines.push('')
  }

  // Footer
  lines.push(`*Exported from Playground on ${new Date().toLocaleString()}*`)

  return lines.join('\n')
}

/**
 * Trigger browser download of text content
 */
export function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export session as JSON and download
 */
export function downloadSessionAsJSON(session: Session) {
  const json = exportSessionAsJSON(session)
  const filename = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`
  downloadTextFile(json, filename, 'application/json')
}

/**
 * Export session as Markdown and download
 */
export function downloadSessionAsMarkdown(session: Session) {
  const markdown = exportSessionAsMarkdown(session)
  const filename = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`
  downloadTextFile(markdown, filename, 'text/markdown')
}

/**
 * Generate a safe filename from session name
 */
export function generateSafeFilename(sessionName: string, extension: string): string {
  const safe = sessionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const timestamp = Date.now()
  return `${safe}_${timestamp}.${extension}`
}

/**
 * Validate imported session JSON structure
 */
export function validateImportedSession(data: any): { valid: boolean; error?: string } {
  // Check if data exists
  if (!data) {
    return { valid: false, error: 'No data provided' }
  }

  // Check version
  if (!data.version) {
    return { valid: false, error: 'Missing version field' }
  }

  // Only support v1.0 for now
  if (data.version !== '1.0') {
    return { valid: false, error: `Unsupported version: ${data.version}` }
  }

  // Check session object
  if (!data.session) {
    return { valid: false, error: 'Missing session data' }
  }

  const session = data.session

  // Required fields
  if (!session.name || typeof session.name !== 'string') {
    return { valid: false, error: 'Invalid or missing session name' }
  }

  if (!session.model || typeof session.model !== 'string') {
    return { valid: false, error: 'Invalid or missing model' }
  }

  if (!Array.isArray(session.messages)) {
    return { valid: false, error: 'Messages must be an array' }
  }

  // Validate messages
  for (let i = 0; i < session.messages.length; i++) {
    const msg = session.messages[i]
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: `Invalid message role at index ${i}` }
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: `Invalid message content at index ${i}` }
    }
  }

  return { valid: true }
}

/**
 * Import session from JSON data
 */
export function importSessionFromJSON(jsonData: string): { session: Session | null; error?: string } {
  try {
    const data: ExportedSession = JSON.parse(jsonData)

    // Validate structure
    const validation = validateImportedSession(data)
    if (!validation.valid) {
      return { session: null, error: validation.error }
    }

    // Convert to Session format
    const importedSession: Session = {
      id: `imported_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: `${data.session.name} (imported)`,
      model: data.session.model,
      messages: data.session.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        reasoning: msg.reasoning,
        images: msg.images,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        cost: msg.cost,
        inputTokens: msg.inputTokens,
        outputTokens: msg.outputTokens,
        cachedTokens: msg.cachedTokens,
      })),
      totalCost: data.session.totalCost || 0,
      totalTokens: data.session.totalTokens || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return { session: importedSession }
  } catch (error: any) {
    return {
      session: null,
      error: `Failed to parse JSON: ${error.message}`,
    }
  }
}

/**
 * Trigger file picker and import session
 */
export function importSessionFromFile(onSuccess: (session: Session) => void, onError: (error: string) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) {
      onError('No file selected')
      return
    }

    try {
      const text = await file.text()
      const result = importSessionFromJSON(text)

      if (result.session) {
        onSuccess(result.session)
      } else {
        onError(result.error || 'Unknown error during import')
      }
    } catch (error: any) {
      onError(`Failed to read file: ${error.message}`)
    }
  }

  input.click()
}
