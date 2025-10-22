'use client'

/**
 * AI Chat Overlay - Minimal Implementation
 *
 * Simple modal for AI-powered search
 * - User asks a question in natural language
 * - AI analyzes and executes search
 * - Shows AI response + search results
 */

import { useState } from 'react'
import { X, Bot, Send, Loader2, Sparkles } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'
import type { AISearchResult } from '@/lib/ai-search-agent'
import { WebResults } from './web-results'
import { ImageResults } from './image-results'
import { VideoResults } from './video-results'
import { PlacesResults } from './places-results'
import { NewsResults } from './news-results'
import { ScholarResults } from './scholar-results'
import { ShoppingResults } from './shopping-results'
import { toast } from 'sonner'

interface AIChatOverlayProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  aiModel?: string
  maxResults?: number
  showReasoning?: boolean
}

export function AIChatOverlay({
  isOpen,
  onClose,
  initialQuery = '',
  aiModel = 'groq/compound',
  maxResults = 10,
  showReasoning = false,
}: AIChatOverlayProps) {
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AISearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  /**
   * Execute AI search
   */
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!query.trim()) {
      toast.error('Please enter a question')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          model: aiModel,
          maxTokens: 2000,
          includeReasoning: showReasoning,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI search failed')
      }

      const data = await response.json()
      setResult(data.data)

      // Show cache status
      if (data.cached) {
        toast.success('Results retrieved from cache')
      }
    } catch (err: any) {
      console.error('[AI Chat] Error:', err)
      setError(err.message || 'Failed to perform AI search')
      toast.error(err.message || 'AI search failed')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Render search results based on type
   */
  function renderResults() {
    if (!result) return null

    const results = result.results

    switch (result.searchType) {
      case 'search':
        return <WebResults data={results as any} />
      case 'images':
        return <ImageResults data={results as any} />
      case 'videos':
        return <VideoResults data={results as any} />
      case 'places':
      case 'maps':
        return <PlacesResults data={results as any} />
      case 'news':
        return <NewsResults data={results as any} />
      case 'scholar':
        return <ScholarResults data={results as any} />
      case 'shopping':
        return <ShoppingResults data={results as any} />
      default:
        return <div className="text-gray-500 text-sm">No results to display</div>
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white border-2 border-black rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI Search Assistant</h2>
                <p className="text-xs text-gray-500">
                  Ask anything • Model: {aiModel.split('/').pop()?.substring(0, 20)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-gray-900" />
            </button>
          </div>

          {/* Content Area (scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Empty State */}
            {!result && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ask me anything
                </h3>
                <p className="text-sm text-gray-600 max-w-md">
                  I'll analyze your question, choose the best search type, and find relevant results for you.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>• Web search</div>
                  <div>• Images</div>
                  <div>• Videos</div>
                  <div>• Places</div>
                  <div>• News</div>
                  <div>• Shopping</div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">AI is analyzing your question...</p>
                <p className="text-xs text-gray-500 mt-2">
                  This may take 5-10 seconds
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 border-2 border-red-500 bg-red-50 rounded-lg">
                <h3 className="font-bold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* AI Response */}
            {result && (
              <div className="space-y-4">
                {/* AI Summary */}
                <div className="p-4 border-2 border-black bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-gray-900" />
                    <span className="font-bold text-sm text-gray-900">AI Response</span>
                    <span className="text-xs text-gray-500">
                      • {result.searchType} search
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {result.aiResponse}
                  </p>

                  {/* Reasoning (if enabled) */}
                  {showReasoning && result.reasoning && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                        View AI reasoning
                      </summary>
                      <p className="mt-2 text-gray-600 italic">
                        {result.reasoning}
                      </p>
                    </details>
                  )}

                  {/* Metadata */}
                  <div className="mt-3 pt-3 border-t border-gray-300 flex items-center gap-4 text-xs text-gray-500">
                    <div>
                      Query: <span className="font-medium">{result.searchQuery}</span>
                    </div>
                    <div>
                      Cost: <span className="font-medium">${result.cost.totalCost.toFixed(5)}</span>
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">
                    Search Results ({result.searchType})
                  </h3>
                  {renderResults()}
                </div>
              </div>
            )}
          </div>

          {/* Input Area (sticky bottom) */}
          <div className="border-t-2 border-black p-4 bg-white">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything... (e.g., 'What's the weather in Tokyo?')"
                  disabled={loading}
                  className="flex-1 px-4 py-3 border-2 border-black rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 text-base disabled:opacity-50"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
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
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </form>

            {/* Hint */}
            <p className="text-xs text-gray-500 mt-2">
              Try: "Best pizza in NYC" • "How to tie a tie" • "Latest AI news" • "Cheap laptops"
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
