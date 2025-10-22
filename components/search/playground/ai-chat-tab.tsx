'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, Sparkles } from 'lucide-react'
import type { SerperResponse, SerperSearchType } from '@/lib/serper-types'
import { AIMessage } from './ai-message'
import { UserMessage } from './user-message'
import { QuickActionChips } from './quick-action-chips'
import { getQuickActionsWithCustom } from '@/lib/ai-chat-quick-actions'
import { CompoundModelDisplay, loadSelectedModel, saveSelectedModel } from './compound-model-display'
import { AIUsageStats } from './ai-usage-stats'
import { ToolExecutionBadge } from './tool-execution-badge'
import { ModelUsageBreakdown } from './model-usage-breakdown'
import {
  recordUserMessage,
  recordAIMessage,
  loadUsageStats,
} from '@/lib/ai-chat-usage-tracker'

interface MessageMetadata {
  executedTools?: string[]
  usageBreakdown?: {
    models: Array<{
      model: string
      usage: {
        queue_time?: number
        prompt_tokens: number
        prompt_time?: number
        completion_tokens: number
        completion_time?: number
        total_tokens: number
        total_time?: number
      }
    }>
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  metadata?: MessageMetadata
}

interface AIChatTabProps {
  searchResults: SerperResponse | null
  searchType: SerperSearchType
  initialConversationHistory?: Message[]
  onConversationUpdate?: (
    conversationHistory: any[],
    messageCount: number,
    totalTokens: number,
    estimatedCost: number
  ) => void
}

export function AIChatTab({
  searchResults,
  searchType,
  initialConversationHistory = [],
  onConversationUpdate,
}: AIChatTabProps) {
  const [messages, setMessages] = useState<Message[]>(initialConversationHistory)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel] = useState(loadSelectedModel()) // Always groq/compound
  const [statsKey, setStatsKey] = useState(0) // For forcing stats refresh
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message (reusable for manual input and quick actions)
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || loading) return

    const userMessage = messageContent.trim()

    // Record user message for usage tracking
    recordUserMessage(userMessage)

    // Add user message to chat
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/search/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          searchResults,
          conversationHistory: messages,
          model: selectedModel,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let messageMetadata: MessageMetadata | undefined

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)

                // Handle content updates
                if (parsed.content) {
                  assistantMessage += parsed.content

                  // Update UI with streaming content
                  setMessages([
                    ...newMessages,
                    { role: 'assistant', content: assistantMessage, metadata: messageMetadata },
                  ])
                }

                // Handle metadata (tool execution and usage breakdown)
                if (parsed.metadata) {
                  messageMetadata = parsed.metadata
                  // Update final message with metadata
                  setMessages([
                    ...newMessages,
                    { role: 'assistant', content: assistantMessage, metadata: messageMetadata },
                  ])
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }

        // Record AI message for usage tracking
        recordAIMessage(assistantMessage, selectedModel)
        setStatsKey((k) => k + 1) // Force stats refresh

        // Update conversation history in session
        if (onConversationUpdate) {
          const finalMessages = [
            ...newMessages,
            { role: 'assistant' as const, content: assistantMessage },
          ]
          const stats = loadUsageStats()
          onConversationUpdate(
            finalMessages,
            stats.totalMessages,
            stats.totalTokens,
            stats.estimatedCost
          )
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Chat error:', error)
        setMessages([
          ...newMessages,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ])
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
    setInput('')
  }

  // Handle quick action click
  const handleQuickAction = async (prompt: string) => {
    await sendMessage(prompt)
  }

  // Quick actions state (refreshable when deleted)
  const [quickActions, setQuickActions] = useState(() =>
    getQuickActionsWithCustom(searchType)
  )

  // Refresh quick actions when deleted or search type changes
  const refreshQuickActions = () => {
    setQuickActions(getQuickActionsWithCustom(searchType))
  }

  // Refresh actions when search type changes
  useEffect(() => {
    refreshQuickActions()
  }, [searchType])

  const hasResults = searchResults && Object.keys(searchResults).length > 0

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header - Compact on Mobile */}
      <div className="flex-shrink-0 px-2 py-1.5 md:px-6 md:py-4 border-b-2 border-slate-700 bg-slate-900">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="p-1 md:p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md md:rounded-lg">
              <Sparkles className="h-3 w-3 md:h-5 md:w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xs md:text-lg">AI Assistant</h3>
              <p className="text-slate-400 text-[10px] md:text-sm hidden md:block">
                {hasResults
                  ? 'Ask questions about your search results'
                  : 'No results yet - perform a search to get started'}
              </p>
            </div>
          </div>

          {/* Model Display - Compact on Mobile */}
          <div className="scale-75 md:scale-100 origin-right">
            <CompoundModelDisplay />
          </div>
        </div>
      </div>

      {/* Quick Action Chips - Minimal on Mobile */}
      {hasResults && (
        <div className="flex-shrink-0 px-1 py-1 md:px-0 md:py-0">
          <QuickActionChips
            actions={quickActions}
            onActionClick={handleQuickAction}
            onActionsChange={refreshQuickActions}
            disabled={loading}
          />
        </div>
      )}

      {/* Messages Area - Maximum Space on Mobile */}
      <div className="flex-1 overflow-y-auto px-2 py-2 md:px-6 md:py-4 space-y-2 md:space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Bot className="h-5 w-5 md:h-8 md:w-8 text-white" />
              </div>
              <h4 className="text-white font-semibold text-sm md:text-lg mb-1 md:mb-2">
                AI Search Assistant
              </h4>
              <p className="text-slate-400 text-xs md:text-sm mb-2 md:mb-4">
                I can help you with:
              </p>
              <ul className="text-left text-slate-300 text-xs md:text-sm space-y-1 md:space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Analyzing and summarizing search results
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Extracting specific information
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Building prompts and workflows
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Suggesting next steps and actions
                </li>
              </ul>
              {!hasResults && (
                <p className="text-yellow-400 text-xs md:text-sm mt-2 md:mt-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-2 md:p-3">
                  Perform a search first to enable AI assistance with results
                </p>
              )}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) =>
            msg.role === 'user' ? (
              <UserMessage key={idx} content={msg.content} />
            ) : (
              <div key={idx}>
                <AIMessage content={msg.content} />
                {msg.metadata && (
                  <div className="ml-8 md:ml-11">
                    <ToolExecutionBadge executedTools={msg.metadata.executedTools} />
                    <ModelUsageBreakdown usageBreakdown={msg.metadata.usageBreakdown} />
                  </div>
                )}
              </div>
            )
          )
        )}

        {loading && (
          <div className="flex gap-2 md:gap-3 justify-start">
            <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
            <div className="bg-slate-800 border-2 border-slate-700 rounded-lg px-2 py-1.5 md:px-4 md:py-3">
              <div className="flex items-center gap-1 md:gap-2">
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-purple-400" />
                <span className="text-xs md:text-sm text-slate-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Usage Statistics - Compact on Mobile */}
      <div className="flex-shrink-0 scale-75 md:scale-100 origin-bottom">
        <AIUsageStats key={statsKey} onReset={() => setStatsKey((k) => k + 1)} />
      </div>

      {/* Input Area - Minimal Padding on Mobile */}
      <div className="flex-shrink-0 px-2 py-2 md:px-6 md:py-4 border-t-2 border-slate-700 bg-slate-900">
        <form onSubmit={handleSubmit} className="flex gap-1.5 md:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasResults
                ? 'Ask about the search results...'
                : 'Perform a search first...'
            }
            disabled={loading || !hasResults}
            className="flex-1 bg-slate-800 border-2 border-slate-600 rounded-lg px-2 py-2 md:px-4 md:py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !hasResults}
            className="px-3 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-1 md:gap-2 text-white font-medium text-xs md:text-sm min-h-[44px]"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
            ) : (
              <Send className="h-3 w-3 md:h-4 md:w-4" />
            )}
            <span className="hidden md:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
