'use client'

/**
 * Typing Indicator
 *
 * Animated "..." dots to show AI is thinking/processing.
 * - Multiple states: analyzing, searching, summarizing
 * - Smooth fade-in/fade-out transitions
 * - Bouncing dot animation
 */

import { Bot, Loader2 } from 'lucide-react'

interface TypingIndicatorProps {
  stage?: 'analyzing' | 'searching' | 'summarizing' | 'thinking'
}

export function TypingIndicator({ stage = 'thinking' }: TypingIndicatorProps) {
  const stageMessages = {
    analyzing: 'AI is analyzing your query...',
    searching: 'AI is searching...',
    summarizing: 'AI is summarizing results...',
    thinking: 'AI is thinking...',
  }

  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="max-w-[85%]">
        <div className="p-4 bg-white border-2 border-black rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-3">
          {/* Bot Icon with Pulse Animation */}
          <div className="p-1.5 bg-black rounded-lg">
            <Bot className="h-4 w-4 text-white animate-pulse" />
          </div>

          {/* Stage Message */}
          <span className="text-sm text-gray-600 animate-pulse">
            {stageMessages[stage]}
          </span>

          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
