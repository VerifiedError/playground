'use client'

// Keyboard Shortcuts Modal
// Displays all available keyboard shortcuts organized by category

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KEYBOARD_SHORTCUTS,
  getCategories,
  getShortcutsByCategory,
  formatShortcut,
  type KeyboardShortcut,
} from '@/lib/keyboard-shortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const categories = getCategories()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
            aria-describedby="shortcuts-modal-description"
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 border-2 border-black rounded-lg shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-black">
                <div>
                  <h2 id="shortcuts-modal-title" className="text-2xl font-bold">Keyboard Shortcuts</h2>
                  <p id="shortcuts-modal-description" className="text-sm text-muted-foreground mt-1">
                    Navigate faster with these shortcuts
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Close keyboard shortcuts modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 space-y-6">
                {categories.map((category) => {
                  const shortcuts = getShortcutsByCategory(category)
                  if (shortcuts.length === 0) return null

                  return (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {shortcuts.map((shortcut, index) => (
                          <ShortcutRow key={index} shortcut={shortcut} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t-2 border-black bg-muted/30">
                <p className="text-xs text-center text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">Esc</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Individual shortcut row component
 */
function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  const formattedKey = formatShortcut(shortcut)

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {shortcut.description}
      </span>
      <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-black rounded-lg text-sm font-mono font-semibold min-w-[80px] text-center">
        {formattedKey}
      </kbd>
    </div>
  )
}
