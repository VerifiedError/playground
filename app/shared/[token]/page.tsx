'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Lock, Eye, Calendar, DollarSign, MessageSquare } from 'lucide-react'
import { formatCost } from '@/lib/cost-calculator'

interface Message {
  id: string
  role: string
  content: string
  reasoning?: string | null
  attachments?: string | null
  toolCalls?: string | null
  createdAt: string
  cost: number
  inputTokens: number
  outputTokens: number
  cachedTokens: number
}

interface SessionData {
  session: {
    id: string
    title: string
    model: string
    totalCost: number
    messageCount: number
    createdAt: string
    updatedAt: string
    messages: Message[]
  }
  sharedInfo: {
    viewCount: number
    createdAt: string
    expiresAt: string | null
  }
}

export default function SharedSessionPage() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<SessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSession = async (pwd?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const headers: HeadersInit = {}
      if (pwd) {
        headers['x-share-password'] = pwd
      }

      const response = await fetch(`/api/shared/${token}`, { headers })
      const result = await response.json()

      if (!response.ok) {
        if (result.passwordRequired) {
          setPasswordRequired(true)
          setError(null)
        } else {
          setError(result.error || 'Failed to load shared session')
        }
        return
      }

      setData(result)
      setPasswordRequired(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load shared session')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [token])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSession(password)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared session...</p>
        </div>
      </div>
    )
  }

  if (passwordRequired && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border-2 border-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Password Required</h1>
                <p className="text-sm text-muted-foreground">
                  This session is password protected
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-gray-900"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Unlock Session
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { session, sharedInfo } = data

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-semibold truncate">
                {session.title}
              </h1>
              <p className="text-sm text-muted-foreground">Shared Session (Read-Only)</p>
            </div>
            <a
              href="/"
              className="ml-4 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Playground
            </a>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border-b-2 border-blue-200 dark:border-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{session.messageCount} messages</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{formatCost(session.totalCost)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{sharedInfo.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Shared {new Date(sharedInfo.createdAt).toLocaleDateString()}
              </span>
            </div>
            {sharedInfo.expiresAt && (
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Lock className="h-4 w-4" />
                <span>
                  Expires {new Date(sharedInfo.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {session.messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg border-2 ${
              message.role === 'user'
                ? 'bg-gray-50 dark:bg-gray-900 border-black'
                : 'bg-white dark:bg-black border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
              {message.cost > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatCost(message.cost)}
                </span>
              )}
            </div>

            {message.reasoning && (
              <details className="mb-2">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  AI Reasoning
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {message.reasoning}
                </div>
              </details>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>

            {message.toolCalls && (
              <div className="mt-2 text-xs text-muted-foreground">
                Used tools: {JSON.parse(message.toolCalls).length}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-muted/50 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>This is a shared read-only view. Create your own sessions at <a href="/" className="text-primary hover:underline">Playground</a>.</p>
        </div>
      </footer>
    </div>
  )
}
