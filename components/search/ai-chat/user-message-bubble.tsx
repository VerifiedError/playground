'use client'

/**
 * User Message Bubble
 *
 * Right-aligned message bubble for user queries.
 * - Black background with white text
 * - Rounded corners with tail on bottom-right
 * - Max width 80% for readability
 * - Timestamps and touch-friendly sizing
 */

import { formatDistanceToNow } from 'date-fns'

interface UserMessageBubbleProps {
  content: string
  createdAt?: string | Date
  timestamp?: string | Date  // Support both prop names
  showTimestamp?: boolean
}

export function UserMessageBubble({
  content,
  createdAt,
  timestamp: timestampProp,
  showTimestamp = true,
}: UserMessageBubbleProps) {
  const timestamp = createdAt || timestampProp
  const displayTimestamp = timestamp
    ? (typeof timestamp === 'string' ? new Date(timestamp) : timestamp)
    : new Date()

  return (
    <div className="flex justify-end animate-fadeIn">
      <div className="max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
        <div className="p-2.5 sm:p-3 md:p-4 bg-black text-white rounded-2xl rounded-br-sm shadow-sm">
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </p>
        </div>
        {showTimestamp && (
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1 px-2">
            {formatDistanceToNow(displayTimestamp, { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  )
}
