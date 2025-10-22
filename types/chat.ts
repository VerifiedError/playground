/**
 * Shared TypeScript types for chat functionality
 */

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning?: string
  cost?: number
  inputTokens?: number
  outputTokens?: number
  createdAt?: Date
  toolCalls?: any[]
  attachments?: any[]
}

export interface UploadedFile {
  id: string
  filename: string
  size: number
  mimeType: string
  text?: string
  metadata?: Record<string, any>
}

export interface ChatSession {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
}
