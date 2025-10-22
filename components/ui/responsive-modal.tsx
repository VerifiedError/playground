'use client'

import { ReactNode } from 'react'
import { X, ArrowLeft } from 'lucide-react'

interface ResponsiveModalProps {
  /** Modal title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Modal content */
  children: ReactNode
  /** Optional footer content (fixed at bottom on mobile) */
  footer?: ReactNode
  /** Close handler */
  onClose: () => void
  /** Optional: Use back arrow instead of X on mobile */
  useBackButton?: boolean
  /** Optional: Custom max width for desktop (default: max-w-5xl) */
  maxWidth?: string
  /** Optional: Custom height for desktop (default: h-[90vh]) */
  height?: string
  /** Optional: Additional classes for content area */
  contentClassName?: string
}

/**
 * ResponsiveModal - Mobile-first modal component
 *
 * Behavior:
 * - Mobile (<768px): Fullscreen with slide-up animation
 * - Desktop (≥768px): Centered modal with max-width
 *
 * Features:
 * - Safe area insets for iOS notch
 * - Fixed header and footer
 * - Scrollable content area
 * - WCAG AAA compliant touch targets (44px minimum)
 * - Smooth transitions
 */
export function ResponsiveModal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  useBackButton = false,
  maxWidth = 'max-w-5xl',
  height = 'h-[90vh]',
  contentClassName = ''
}: ResponsiveModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        {/* Modal */}
        <div
          className={`
            bg-white rounded-t-2xl md:rounded-lg border-2 border-black
            w-full md:${maxWidth} ${height}
            flex flex-col
            max-h-screen
            animate-slide-up md:animate-fade-in
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="flex-shrink-0 border-b-2 border-black bg-white rounded-t-2xl md:rounded-t-lg">
            <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Close/Back Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={useBackButton ? 'Go back' : 'Close'}
              >
                {useBackButton ? (
                  <ArrowLeft className="h-5 w-5 text-gray-900" />
                ) : (
                  <X className="h-5 w-5 text-gray-900" />
                )}
              </button>
            </div>

            {/* iOS Safe Area Top Padding (only visible on mobile) */}
            <div className="md:hidden h-safe-top" style={{ height: 'env(safe-area-inset-top)' }} />
          </div>

          {/* Content - Scrollable */}
          <div className={`flex-1 overflow-y-auto overscroll-y-contain ${contentClassName}`}>
            {children}
          </div>

          {/* Footer - Fixed (if provided) */}
          {footer && (
            <div className="flex-shrink-0 border-t-2 border-black bg-white rounded-b-2xl md:rounded-b-lg">
              <div className="px-4 md:px-6 py-4">
                {footer}
              </div>

              {/* iOS Safe Area Bottom Padding (only visible on mobile) */}
              <div
                className="md:hidden"
                style={{ height: 'max(env(safe-area-inset-bottom), 1rem)' }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Add these animations to global CSS if not already present:
// @keyframes slide-up {
//   from { transform: translateY(100%); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }
// @keyframes fade-in {
//   from { opacity: 0; scale: 0.95; }
//   to { opacity: 1; scale: 1; }
// }
// .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
// .animate-fade-in { animation: fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
