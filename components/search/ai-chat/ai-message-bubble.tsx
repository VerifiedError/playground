'use client'

/**
 * AI Message Bubble
 *
 * Left-aligned message bubble for AI responses.
 * - White background with black border
 * - Markdown rendering support
 * - Search type and cost badges
 * - Rounded corners with tail on bottom-left
 * - Bot icon indicator
 */

import { Bot, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIMessageBubbleProps {
  content: string
  createdAt?: string | Date
  timestamp?: string | Date  // Support both prop names
  searchType?: string | null
  cost?: number | null
  inputTokens?: number | null
  outputTokens?: number | null
  tokens?: number | null  // Support tokens as alternative
  showTimestamp?: boolean
  showCost?: boolean
  streaming?: boolean  // Support streaming flag
}

export function AIMessageBubble({
  content,
  createdAt,
  timestamp: timestampProp,
  searchType,
  cost,
  inputTokens,
  outputTokens,
  tokens,
  showTimestamp = true,
  showCost = false,
  streaming = false,
}: AIMessageBubbleProps) {
  const timestamp = createdAt || timestampProp
  const displayTimestamp = timestamp
    ? (typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
    : new Date()

  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="max-w-[90%] sm:max-w-[85%] flex flex-col items-start">
        {/* Message Bubble */}
        <div className="p-2.5 sm:p-3 md:p-4 bg-white border-2 border-black rounded-2xl rounded-bl-sm shadow-sm w-full">
          {/* Header with Bot Icon and Search Type - More compact on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b border-gray-200">
            <div className="p-1 sm:p-1.5 bg-black rounded-lg">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-gray-900">AI Assistant</span>
            {searchType && searchType !== 'playground' && (
              <span className="ml-auto text-[10px] sm:text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-gray-300">
                {searchType}
              </span>
            )}
          </div>

          {/* Markdown Content - Smaller prose on mobile */}
          <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-strong:text-gray-900 prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:text-xs sm:prose-pre:text-sm prose-a:text-blue-600 prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>

          {/* Streaming indicator */}
          {streaming && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-[10px] sm:text-xs">Generating...</span>
            </div>
          )}

          {/* Cost Badge - Hidden on mobile for space */}
          {showCost && cost !== null && cost !== undefined && (
            <div className="hidden sm:flex mt-3 pt-3 border-t border-gray-200 items-center gap-2 text-xs text-gray-600">
              <DollarSign className="h-3 w-3" />
              <span>Cost: ${cost.toFixed(5)}</span>
              {(inputTokens !== null || tokens !== null) && outputTokens !== null && (
                <span className="text-gray-500">
                  ({inputTokens || tokens || 0} in + {outputTokens} out tokens)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timestamp - Smaller on mobile */}
        {showTimestamp && (
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-2">
            {formatDistanceToNow(displayTimestamp, { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  )
}
