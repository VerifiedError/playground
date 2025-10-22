import { create } from 'zustand'
import { generateSessionName, isDefaultSessionName } from '@/lib/session-name-generator'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning?: string
  images?: string[] // For vision messages
  timestamp?: Date
  // Cost tracking (per message)
  cost?: number
  inputTokens?: number
  outputTokens?: number
  cachedTokens?: number
  // Edit tracking
  edited?: boolean
  editedAt?: Date
}

export interface Session {
  id: string
  name: string
  model: string
  messages: Message[]
  totalCost: number
  totalTokens: number
  createdAt: Date
  updatedAt: Date
  // Organization fields
  isStarred?: boolean
  folderId?: string | null
  tags?: string[]
  isArchived?: boolean
  // Template fields
  isTemplate?: boolean
  templateDescription?: string | null
  // Branching fields
  parentSessionId?: string | null
  branchPoint?: number | null
}

interface SessionStore {
  sessions: Session[]
  currentSessionId: string | null

  // Session management
  createSession: (model: string, name?: string) => Promise<Session>
  deleteSession: (sessionId: string) => Promise<void>
  setCurrentSession: (sessionId: string) => void
  updateSessionName: (sessionId: string, name: string) => Promise<void>

  // Message management
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  editMessage: (sessionId: string, messageId: string, content: string) => Promise<void>
  deleteMessage: (sessionId: string, messageId: string) => Promise<void>
  deleteMessagesFrom: (sessionId: string, messageIndex: number) => Promise<void>
  clearMessages: () => void

  // Session data
  getCurrentSession: () => Session | null
  getSessionById: (sessionId: string) => Session | null

  // Persistence
  loadSessions: (sessions: Session[]) => void
  loadSessionsFromDB: () => Promise<void>
  updateSessionCost: (sessionId: string, cost: number, tokens: number) => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,

  createSession: async (model: string, name?: string) => {
    try {
      // Create session in database
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, name }),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const { session } = await response.json()

      // Add to local state
      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSessionId: session.id,
      }))

      return session
    } catch (error) {
      console.error('Failed to create session:', error)
      // Fallback to client-only session
      const newSession: Session = {
        id: Date.now().toString(),
        name: name || `Chat ${new Date().toLocaleString()}`,
        model,
        messages: [],
        totalCost: 0,
        totalTokens: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id,
      }))

      return newSession
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      // Delete from database
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      // Remove from local state
      set((state) => {
        const newSessions = state.sessions.filter((s) => s.id !== sessionId)
        const newCurrentId = state.currentSessionId === sessionId
          ? (newSessions[0]?.id || null)
          : state.currentSessionId

        return {
          sessions: newSessions,
          currentSessionId: newCurrentId,
        }
      })
    } catch (error) {
      console.error('Failed to delete session:', error)
      // Still remove from local state
      set((state) => {
        const newSessions = state.sessions.filter((s) => s.id !== sessionId)
        const newCurrentId = state.currentSessionId === sessionId
          ? (newSessions[0]?.id || null)
          : state.currentSessionId

        return {
          sessions: newSessions,
          currentSessionId: newCurrentId,
        }
      })
    }
  },

  setCurrentSession: (sessionId: string) => {
    set({ currentSessionId: sessionId })
  },

  updateSessionName: async (sessionId: string, name: string) => {
    try {
      // Update in database
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to update session name')
      }

      // Update local state
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, name, updatedAt: new Date() }
            : s
        ),
      }))
    } catch (error) {
      console.error('Failed to update session name:', error)
      // Still update local state
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, name, updatedAt: new Date() }
            : s
        ),
      }))
    }
  },

  addMessage: async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const { currentSessionId } = get()
    if (!currentSessionId) return

    try {
      // Add message to database
      const response = await fetch(`/api/sessions/${currentSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        throw new Error('Failed to add message')
      }

      const { message: savedMessage } = await response.json()

      // Check if this is the first user message for auto-renaming
      const currentSession = get().sessions.find((s) => s.id === currentSessionId)
      const isFirstUserMessage = currentSession &&
        message.role === 'user' &&
        currentSession.messages.filter((m) => m.role === 'user').length === 0
      const shouldAutoRename = isFirstUserMessage && isDefaultSessionName(currentSession.name)

      // Update session cost if message has cost data
      if (message.cost && message.inputTokens !== undefined && message.outputTokens !== undefined) {
        if (currentSession) {
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    totalCost: s.totalCost + (message.cost || 0),
                    totalTokens: s.totalTokens + (message.inputTokens || 0) + (message.outputTokens || 0),
                    messages: [...s.messages, savedMessage],
                    updatedAt: new Date(),
                  }
                : s
            ),
          }))
        }
      } else {
        // Add to local state without cost update
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: [...s.messages, savedMessage],
                  updatedAt: new Date(),
                }
              : s
          ),
        }))
      }

      // Auto-rename session after first user message
      if (shouldAutoRename && message.content) {
        const newName = generateSessionName(message.content)
        await get().updateSessionName(currentSessionId, newName)
      }
    } catch (error) {
      console.error('Failed to add message:', error)
      // Fallback to client-only message
      const newMessage: Message = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      }

      // Check if this is the first user message for auto-renaming (fallback)
      const currentSession = get().sessions.find((s) => s.id === currentSessionId)
      const isFirstUserMessage = currentSession &&
        message.role === 'user' &&
        currentSession.messages.filter((m) => m.role === 'user').length === 0
      const shouldAutoRename = isFirstUserMessage && isDefaultSessionName(currentSession.name)

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...s.messages, newMessage],
                totalCost: s.totalCost + (message.cost || 0),
                totalTokens: s.totalTokens + (message.inputTokens || 0) + (message.outputTokens || 0),
                updatedAt: new Date(),
              }
            : s
        ),
      }))

      // Auto-rename session after first user message (fallback)
      if (shouldAutoRename && message.content) {
        const newName = generateSessionName(message.content)
        await get().updateSessionName(currentSessionId, newName)
      }
    }
  },

  updateMessage: (messageId: string, updates: Partial<Message>) => {
    const { currentSessionId } = get()
    if (!currentSessionId) return

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
              updatedAt: new Date(),
            }
          : s
      ),
    }))
  },

  editMessage: async (sessionId: string, messageId: string, content: string) => {
    try {
      // Update message in database
      const response = await fetch(`/api/sessions/${sessionId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to edit message')
      }

      const { message: updatedMessage } = await response.json()

      // Update local state
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, content, edited: true, editedAt: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : s
        ),
      }))
    } catch (error) {
      console.error('Failed to edit message:', error)
      // Still update local state
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, content, edited: true, editedAt: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : s
        ),
      }))
    }
  },

  deleteMessage: async (sessionId: string, messageId: string) => {
    try {
      // Delete message from database
      const response = await fetch(`/api/sessions/${sessionId}/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      // Update local state - recalculate cost
      set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id !== sessionId) return s

          const deletedMessage = s.messages.find((m) => m.id === messageId)
          const newMessages = s.messages.filter((m) => m.id !== messageId)
          const costDelta = deletedMessage?.cost || 0
          const tokenDelta = (deletedMessage?.inputTokens || 0) + (deletedMessage?.outputTokens || 0)

          return {
            ...s,
            messages: newMessages,
            totalCost: Math.max(0, s.totalCost - costDelta),
            totalTokens: Math.max(0, s.totalTokens - tokenDelta),
            updatedAt: new Date(),
          }
        }),
      }))
    } catch (error) {
      console.error('Failed to delete message:', error)
      // Still update local state
      set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id !== sessionId) return s

          const deletedMessage = s.messages.find((m) => m.id === messageId)
          const newMessages = s.messages.filter((m) => m.id !== messageId)
          const costDelta = deletedMessage?.cost || 0
          const tokenDelta = (deletedMessage?.inputTokens || 0) + (deletedMessage?.outputTokens || 0)

          return {
            ...s,
            messages: newMessages,
            totalCost: Math.max(0, s.totalCost - costDelta),
            totalTokens: Math.max(0, s.totalTokens - tokenDelta),
            updatedAt: new Date(),
          }
        }),
      }))
    }
  },

  deleteMessagesFrom: async (sessionId: string, messageIndex: number) => {
    try {
      // Delete messages from database
      const response = await fetch(`/api/sessions/${sessionId}/messages/from/${messageIndex}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete messages')
      }

      // Update local state - recalculate cost
      set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id !== sessionId) return s

          const messagesToDelete = s.messages.slice(messageIndex)
          const newMessages = s.messages.slice(0, messageIndex)

          const costDelta = messagesToDelete.reduce((sum, m) => sum + (m.cost || 0), 0)
          const tokenDelta = messagesToDelete.reduce(
            (sum, m) => sum + (m.inputTokens || 0) + (m.outputTokens || 0),
            0
          )

          return {
            ...s,
            messages: newMessages,
            totalCost: Math.max(0, s.totalCost - costDelta),
            totalTokens: Math.max(0, s.totalTokens - tokenDelta),
            updatedAt: new Date(),
          }
        }),
      }))
    } catch (error) {
      console.error('Failed to delete messages:', error)
      // Still update local state
      set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id !== sessionId) return s

          const messagesToDelete = s.messages.slice(messageIndex)
          const newMessages = s.messages.slice(0, messageIndex)

          const costDelta = messagesToDelete.reduce((sum, m) => sum + (m.cost || 0), 0)
          const tokenDelta = messagesToDelete.reduce(
            (sum, m) => sum + (m.inputTokens || 0) + (m.outputTokens || 0),
            0
          )

          return {
            ...s,
            messages: newMessages,
            totalCost: Math.max(0, s.totalCost - costDelta),
            totalTokens: Math.max(0, s.totalTokens - tokenDelta),
            updatedAt: new Date(),
          }
        }),
      }))
    }
  },

  clearMessages: () => {
    const { currentSessionId } = get()
    if (!currentSessionId) return

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [], updatedAt: new Date() }
          : s
      ),
    }))
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get()
    return sessions.find((s) => s.id === currentSessionId) || null
  },

  getSessionById: (sessionId: string) => {
    const { sessions } = get()
    return sessions.find((s) => s.id === sessionId) || null
  },

  loadSessions: (sessions: Session[]) => {
    set({
      sessions,
      currentSessionId: sessions[0]?.id || null,
    })
  },

  loadSessionsFromDB: async () => {
    try {
      const response = await fetch('/api/sessions')

      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const { sessions } = await response.json()

      // Convert date strings to Date objects
      const transformedSessions = sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }))

      set({
        sessions: transformedSessions,
        currentSessionId: transformedSessions[0]?.id || null,
      })
    } catch (error) {
      console.error('Failed to load sessions from DB:', error)
      // Keep empty sessions array
    }
  },

  updateSessionCost: (sessionId: string, cost: number, tokens: number) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              totalCost: s.totalCost + cost,
              totalTokens: s.totalTokens + tokens,
              updatedAt: new Date(),
            }
          : s
      ),
    }))
  },
}))
