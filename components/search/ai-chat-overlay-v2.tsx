'use client'

/**
 * AI Chat Overlay V2 - Multi-Turn Conversations
 *
 * Enhanced version with conversation history and persistence.
 * - Multiple conversations
 * - Message history
 * - Auto-save to database
 * - Export conversations
 */

import { useState, useEffect, useRef } from 'react'
import { X, Send, Plus, MessageSquare, Trash2, Download, Menu, Bot, Loader2 } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'
import type { AISearchResult } from '@/lib/ai-search-agent'
import { UserMessageBubble } from './ai-chat/user-message-bubble'
import { AIMessageBubble } from './ai-chat/ai-message-bubble'
import { TypingIndicator } from './ai-chat/typing-indicator'
import { SearchResultCard } from './ai-chat/search-result-card'
import { ScrollToBottomButton } from './ai-chat/scroll-to-bottom-button'
import { toast } from 'sonner'
import { generateConversationTitle } from '@/lib/ai-search-title-generator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  searchQuery?: string | null
  searchType?: string | null
  searchResults?: any
  cost?: number | null
  inputTokens?: number | null
  outputTokens?: number | null
  createdAt: string | Date
}

interface Conversation {
  id: string
  title: string | null
  createdAt: string | Date
  updatedAt: string | Date
  messageCount?: number
  messages?: Message[]
}

interface AIChatOverlayV2Props {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  aiModel?: string
  maxResults?: number
  showReasoning?: boolean
}

export function AIChatOverlayV2({
  isOpen,
  onClose,
  initialQuery = '',
  aiModel = 'groq/compound',
  maxResults = 10,
  showReasoning = false,
}: AIChatOverlayV2Props) {
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showSidebar, setShowSidebar] = useState(false) // Start closed on mobile
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Load conversations on mount
  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

  // Load current conversation messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      loadConversation(currentConversation.id)
    }
  }, [currentConversation?.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Scroll detection for scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

      setShowScrollButton(!isNearBottom)
    }

    const container = messagesContainerRef.current
    container?.addEventListener('scroll', handleScroll)

    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * Load all conversations
   */
  async function loadConversations() {
    setLoadingConversations(true)
    try {
      const response = await fetch('/api/search/ai/conversations')
      if (!response.ok) throw new Error('Failed to load conversations')

      const data = await response.json()
      setConversations(data.conversations || [])

      // If no current conversation, select the most recent one
      if (!currentConversation && data.conversations.length > 0) {
        setCurrentConversation(data.conversations[0])
      }
    } catch (err) {
      console.error('[AI Chat] Failed to load conversations:', err)
      toast.error('Failed to load conversations')
    } finally {
      setLoadingConversations(false)
    }
  }

  /**
   * Load a specific conversation with messages
   */
  async function loadConversation(id: string) {
    try {
      const response = await fetch(`/api/search/ai/conversations/${id}`)
      if (!response.ok) throw new Error('Failed to load conversation')

      const data = await response.json()
      setMessages(data.conversation.messages || [])
    } catch (err) {
      console.error('[AI Chat] Failed to load conversation:', err)
      toast.error('Failed to load conversation')
    }
  }

  /**
   * Create a new conversation
   */
  async function handleNewConversation() {
    try {
      const response = await fetch('/api/search/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) throw new Error('Failed to create conversation')

      const data = await response.json()
      const newConv = data.conversation

      setConversations(prev => [newConv, ...prev])
      setCurrentConversation(newConv)
      setMessages([])
      setQuery('')

      // Auto-close sidebar on mobile after creating conversation
      if (window.innerWidth < 640) {
        setShowSidebar(false)
      }

      toast.success('New conversation started')
    } catch (err) {
      console.error('[AI Chat] Failed to create conversation:', err)
      toast.error('Failed to create conversation')
    }
  }

  /**
   * Delete a conversation
   */
  async function handleDeleteConversation(id: string) {
    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/search/ai/conversations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete conversation')

      setConversations(prev => prev.filter(c => c.id !== id))

      if (currentConversation?.id === id) {
        const remaining = conversations.filter(c => c.id !== id)
        setCurrentConversation(remaining[0] || null)
        setMessages([])
      }

      toast.success('Conversation deleted')
    } catch (err) {
      console.error('[AI Chat] Failed to delete conversation:', err)
      toast.error('Failed to delete conversation')
    }
  }

  /**
   * Execute AI search and add to conversation
   */
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!query.trim()) {
      toast.error('Please enter a question')
      return
    }

    // Create conversation if none exists
    if (!currentConversation) {
      await handleNewConversation()
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (!currentConversation) {
      toast.error('Please create a conversation first')
      return
    }

    setLoading(true)

    try {
      // Add user message to UI immediately (optimistic update)
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: query.trim(),
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, userMessage])
      const currentQuery = query.trim()
      setQuery('')

      // Save user message to database
      const userMsgResponse = await fetch(
        `/api/search/ai/conversations/${currentConversation.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: currentQuery,
          }),
        }
      )

      if (!userMsgResponse.ok) throw new Error('Failed to save user message')
      const userMsgData = await userMsgResponse.json()

      // Update user message with real ID
      setMessages(prev =>
        prev.map(m => m.id === userMessage.id ? userMsgData.message : m)
      )

      // Execute AI search
      const searchResponse = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentQuery,
          model: aiModel,
          maxTokens: 2000,
          includeReasoning: showReasoning,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json()
        throw new Error(errorData.error || 'AI search failed')
      }

      const searchData = await searchResponse.json()
      const result: AISearchResult = searchData.data

      // Create assistant message
      const assistantMessage: Message = {
        id: `temp-asst-${Date.now()}`,
        role: 'assistant',
        content: result.aiResponse,
        searchQuery: result.searchQuery,
        searchType: result.searchType,
        searchResults: result.results,
        cost: result.cost.totalCost,
        inputTokens: result.cost.inputTokens,
        outputTokens: result.cost.outputTokens,
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message to database
      const asstMsgResponse = await fetch(
        `/api/search/ai/conversations/${currentConversation.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: result.aiResponse,
            searchQuery: result.searchQuery,
            searchType: result.searchType,
            searchResults: result.results,
            cost: result.cost.totalCost,
            inputTokens: result.cost.inputTokens,
            outputTokens: result.cost.outputTokens,
          }),
        }
      )

      if (!asstMsgResponse.ok) throw new Error('Failed to save assistant message')
      const asstMsgData = await asstMsgResponse.json()

      // Update assistant message with real ID
      setMessages(prev =>
        prev.map(m => m.id === assistantMessage.id ? asstMsgData.message : m)
      )

      // Auto-generate title if this is the first message
      if (messages.length === 0 && !currentConversation.title) {
        const title = generateConversationTitle(currentQuery)
        await updateConversationTitle(currentConversation.id, title)
      }

    } catch (err: any) {
      console.error('[AI Chat] Error:', err)
      toast.error(err.message || 'AI search failed')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update conversation title
   */
  async function updateConversationTitle(id: string, title: string) {
    try {
      const response = await fetch(`/api/search/ai/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) throw new Error('Failed to update title')

      const data = await response.json()

      // Update local state
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, title: data.conversation.title } : c)
      )

      if (currentConversation?.id === id) {
        setCurrentConversation(prev => prev ? { ...prev, title: data.conversation.title } : null)
      }
    } catch (err) {
      console.error('[AI Chat] Failed to update title:', err)
    }
  }

  /**
   * Export conversation as JSON
   */
  function handleExportConversation() {
    if (!currentConversation) return

    const exportData = {
      id: currentConversation.id,
      title: currentConversation.title,
      createdAt: currentConversation.createdAt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        searchType: m.searchType,
        createdAt: m.createdAt,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${currentConversation.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Conversation exported')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
        <div
          className="bg-white border-0 sm:border-2 sm:border-black sm:rounded-2xl w-full sm:max-w-6xl h-full sm:max-h-[90vh] flex overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar - Conversation List (Overlay on Mobile, Side-by-side on Desktop) */}
          {showSidebar && (
            <div className="absolute sm:relative inset-y-0 left-0 w-full sm:w-64 border-r-2 border-black flex flex-col bg-gray-50 z-10 sm:z-auto">
              {/* Sidebar Header */}
              <div className="p-4 border-b-2 border-black flex items-center gap-2">
                <button
                  onClick={handleNewConversation}
                  className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm font-medium">New Chat</span>
                </button>
                {/* Close Sidebar on Mobile */}
                <button
                  onClick={() => setShowSidebar(false)}
                  className="sm:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5 text-gray-900" />
                </button>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto p-2">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                        currentConversation?.id === conv.id
                          ? 'bg-white border-2 border-black'
                          : 'bg-white border-2 border-gray-300 hover:border-gray-500'
                      }`}
                      onClick={() => {
                        setCurrentConversation(conv)
                        // Auto-close sidebar on mobile after selection
                        if (window.innerWidth < 640) {
                          setShowSidebar(false)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {conv.title || 'New conversation'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {conv.messageCount || 0} messages
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteConversation(conv.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Toggle conversations"
                >
                  <Menu className="h-6 w-6 text-gray-900" />
                </button>
                <div className="p-2 bg-black rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentConversation?.title || 'AI Search'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Multi-turn conversation • {aiModel.split('/').pop()?.substring(0, 20)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentConversation && messages.length > 0 && (
                  <button
                    onClick={handleExportConversation}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export conversation"
                  >
                    <Download className="h-5 w-5 text-gray-900" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6 text-gray-900" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md">
                    Ask anything and I'll help you find information using AI-powered search.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className="space-y-3">
                      {/* User Message Bubble */}
                      {msg.role === 'user' && (
                        <UserMessageBubble
                          content={msg.content}
                          createdAt={msg.createdAt}
                          showTimestamp={true}
                        />
                      )}

                      {/* AI Message Bubble */}
                      {msg.role === 'assistant' && (
                        <>
                          <AIMessageBubble
                            content={msg.content}
                            createdAt={msg.createdAt}
                            searchType={msg.searchType}
                            cost={msg.cost}
                            inputTokens={msg.inputTokens}
                            outputTokens={msg.outputTokens}
                            showTimestamp={true}
                            showCost={true}
                          />

                          {/* Search Results Card */}
                          {msg.searchResults && msg.searchType && (
                            <SearchResultCard
                              searchType={msg.searchType}
                              searchResults={msg.searchResults}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {loading && <TypingIndicator stage="thinking" />}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Scroll to Bottom Button */}
              <ScrollToBottomButton onClick={scrollToBottom} visible={showScrollButton} />
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-black p-4 bg-white">
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 text-base disabled:opacity-50"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-6 py-3 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
