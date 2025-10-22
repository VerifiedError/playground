import { useEffect, useCallback } from 'react'
import type { KeyboardShortcut } from '@/lib/types/keyboard-shortcuts'

export type { KeyboardShortcut }

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Custom hook for registering keyboard shortcuts
 * Supports platform-specific modifiers (Cmd on Mac, Ctrl on Windows/Linux)
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'k',
 *       cmd: true,
 *       ctrl: true,
 *       description: 'Search',
 *       action: () => setSearchOpen(true),
 *     },
 *   ],
 * })
 * ```
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Check if user is typing in an input/textarea/contenteditable
      const target = event.target as HTMLElement
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        // Check if shortcut is global or if we're not in an editable field
        if (!shortcut.global && isEditable) return false

        // Check key match (case-insensitive)
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        if (!keyMatches) return false

        // Check modifiers
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
        const cmdMatches = shortcut.cmd ? event.metaKey : !event.metaKey
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey

        // On Mac, Cmd is the primary modifier, on Windows/Linux it's Ctrl
        // If both cmd and ctrl are specified, either one will work
        const modifierMatches =
          (shortcut.cmd && shortcut.ctrl) ? (event.metaKey || event.ctrlKey) : (ctrlMatches && cmdMatches)

        return modifierMatches && shiftMatches && altMatches
      })

      if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        matchingShortcut.action()
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

/**
 * Get platform-specific modifier key name
 * @returns 'Cmd' on Mac, 'Ctrl' on Windows/Linux
 */
export function getModifierKey(): string {
  if (typeof window === 'undefined') return 'Ctrl'
  return navigator.platform.toUpperCase().includes('MAC') ? 'Cmd' : 'Ctrl'
}

/**
 * Format a keyboard shortcut for display
 * @example
 * ```tsx
 * formatShortcut({ key: 'k', cmd: true, ctrl: true })
 * // Returns: "Cmd+K" on Mac, "Ctrl+K" on Windows/Linux
 * ```
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
  const parts: string[] = []
  const modifierKey = getModifierKey()

  if (shortcut.ctrl || shortcut.cmd) {
    parts.push(modifierKey)
  }
  if (shortcut.shift) {
    parts.push('Shift')
  }
  if (shortcut.alt) {
    parts.push('Alt')
  }

  // Capitalize single letter keys
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key

  parts.push(key)

  return parts.join('+')
}

/**
 * Check if the current platform is Mac
 */
export function isMac(): boolean {
  if (typeof window === 'undefined') return false
  return navigator.platform.toUpperCase().includes('MAC')
}
