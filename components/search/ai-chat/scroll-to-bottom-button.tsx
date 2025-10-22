'use client'

/**
 * Scroll to Bottom Button
 *
 * Floating button that appears when user scrolls up.
 * - Smooth scroll to bottom animation
 * - Appears/disappears based on scroll position
 * - Fixed position at bottom-right of messages area
 */

import { ArrowDown } from 'lucide-react'

interface ScrollToBottomButtonProps {
  onClick: () => void
  visible: boolean
}

export function ScrollToBottomButton({ onClick, visible }: ScrollToBottomButtonProps) {
  if (!visible) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-8 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 z-10 animate-fadeIn"
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="h-5 w-5" />
    </button>
  )
}
