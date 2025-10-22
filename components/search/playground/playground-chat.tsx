'use client'

/**
 * Playground Chat Component
 *
 * Pure AI chat interface for the playground search type.
 * No search results - just direct AI interaction with full model control.
 */

import { useState, useEffect, useRef } from 'react'
import { Loader2, Send, Sparkles, RefreshCw } from 'lucide-react'
import { UserMessageBubble } from '../ai-chat/user-message-bubble'
import { AIMessageBubble } from '../ai-chat/ai-message-bubble'
import { TypingIndicator } from '../ai-chat/typing-indicator'
import { QuickActionChips } from './quick-action-chips'
import { getQuickActions } from '@/lib/ai-chat-quick-actions'
import { AIModelSelector } from './ai-model-selector'
import { AIUsageStats } from './ai-usage-stats'
import type { PlaygroundFilters } from '@/app/search/playground/page'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  cost?: number
  tokens?: number
}

interface PlaygroundChatProps {
  query: string
  filters: PlaygroundFilters
  onFiltersChange: (filters: PlaygroundFilters) => void
  initialConversationHistory?: Message[]
  onConversationUpdate?: (
    conversationHistory: Message[],
    messageCount: number,
    totalTokens: number,
    estimatedCost: number
  ) => void
}

export function PlaygroundChat({
  query,
  filters,
  onFiltersChange,
  initialConversationHistory = [],
  onConversationUpdate,
}: PlaygroundChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialConversationHistory)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [quickActions, setQuickActions] = useState(() => getQuickActions('playground'))

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  // Restore conversation history
  useEffect(() => {
    if (initialConversationHistory && initialConversationHistory.length > 0) {
      setMessages(initialConversationHistory)
    }
  }, [initialConversationHistory])

  // Refresh quick actions
  const refreshQuickActions = () => {
    setQuickActions(getQuickActions('playground'))
  }

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || input.trim()
    if (!messageToSend || loading) return
    if (!filters.selectedModel) {
      alert('Please select an AI model first')
      return
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamingContent('')

    try {
      // Call AI chat API with streaming
      const response = await fetch('/api/search/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          model: filters.selectedModel,
          temperature: filters.temperature || 0.7,
          maxTokens: filters.maxTokens || 2048,
          systemPrompt: filters.systemPrompt,
          enableTools: filters.enableTools !== false,
          conversationHistory: newMessages,
        }),
      })

      if (!response.ok) {
        throw new Error('AI chat request failed')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

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
                if (parsed.content) {
                  fullContent += parsed.content
                  setStreamingContent(fullContent)
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Add AI message
      const aiMessage: Message = {
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)
      setStreamingContent('')

      // Update conversation history
      if (onConversationUpdate) {
        const totalTokens = updatedMessages.reduce(
          (sum, msg) => sum + (msg.tokens || 0),
          0
        )
        const totalCost = updatedMessages.reduce(
          (sum, msg) => sum + (msg.cost || 0),
          0
        )
        onConversationUpdate(
          updatedMessages,
          updatedMessages.length,
          totalTokens,
          totalCost
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const handleClearChat = () => {
    if (
      messages.length > 0 &&
      !confirm('Clear all messages? This cannot be undone.')
    ) {
      return
    }
    setMessages([])
    setStreamingContent('')
    if (onConversationUpdate) {
      onConversationUpdate([], 0, 0, 0)
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header - Hidden on mobile to save space, only show on desktop */}
      <div className="hidden sm:flex border-b-2 border-slate-700 bg-slate-900 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">AI Chat</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <AIModelSelector
              selectedModel={filters.selectedModel || ''}
              onModelChange={(model) =>
                onFiltersChange({ ...filters, selectedModel: model })
              }
              disabled={loading}
            />

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              disabled={loading || messages.length === 0}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              title="Clear chat"
            >
              <RefreshCw className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-only: Minimal header with just clear button */}
      <div className="sm:hidden flex items-center justify-end px-2 py-1 border-b border-slate-700 bg-slate-900">
        <button
          onClick={handleClearChat}
          disabled={loading || messages.length === 0}
          className="p-1 hover:bg-slate-800 rounded transition-colors disabled:opacity-50 text-xs text-slate-400 flex items-center gap-1"
          title="Clear chat"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Container - Compact padding on mobile */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-2 sm:px-6 sm:py-4 space-y-2 sm:space-y-4"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
              AI Playground
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md">
              Pure AI chat with full model control. Start chatting!
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index}>
            {message.role === 'user' ? (
              <UserMessageBubble
                content={message.content}
                timestamp={new Date(message.timestamp)}
              />
            ) : (
              <AIMessageBubble
                content={message.content}
                timestamp={new Date(message.timestamp)}
                searchType="playground"
                cost={message.cost}
                tokens={message.tokens}
              />
            )}
          </div>
        ))}

        {loading && streamingContent && (
          <AIMessageBubble
            content={streamingContent}
            timestamp={new Date()}
            searchType="playground"
            streaming
          />
        )}

        {loading && !streamingContent && <TypingIndicator stage="analyzing" />}
      </div>

      {/* Usage Stats (above input) - Hidden on mobile for space */}
      <div className="hidden sm:block px-6 pb-2 border-t-2 border-slate-700 bg-slate-900">
        <AIUsageStats />
      </div>

      {/* Input Area - Compact on mobile */}
      <div className="border-t-2 border-slate-700 bg-slate-900 px-3 py-2 sm:px-6 sm:py-4 flex-shrink-0 space-y-2 sm:space-y-3">
        {/* Quick Actions - Only show on mobile when no messages */}
        {messages.length === 0 && (
          <div className="sm:block">
            <QuickActionChips
              actions={quickActions}
              onActionClick={handleQuickAction}
              onActionsChange={refreshQuickActions}
              disabled={loading}
            />
          </div>
        )}

        {/* Input Field - Compact on mobile */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={
              filters.selectedModel
                ? 'Type your message...'
                : 'Select a model first'
            }
            rows={2}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            disabled={loading || !filters.selectedModel}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim() || !filters.selectedModel}
            className="p-2.5 sm:p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
