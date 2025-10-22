// Keyboard Shortcuts System
// Centralized keyboard shortcut definitions for the application

export interface KeyboardShortcut {
  key: string
  description: string
  category: 'Global' | 'Chat' | 'Sessions' | 'Navigation'
  action: string
  mac?: string // Mac-specific key combination (if different)
  enabled?: boolean
}

/**
 * Get the correct meta key symbol based on platform
 */
export function getMetaKey(): string {
  if (typeof window !== 'undefined') {
    return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'
  }
  return 'Ctrl'
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const metaKey = getMetaKey()
  return shortcut.key.replace('mod', metaKey)
}

/**
 * Check if user is on Mac
 */
export function isMac(): boolean {
  if (typeof window !== 'undefined') {
    return navigator.platform.toLowerCase().includes('mac')
  }
  return false
}

/**
 * All keyboard shortcuts in the application
 */
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Global shortcuts
  {
    key: 'mod+k',
    description: 'Open quick search',
    category: 'Global',
    action: 'openSearch',
  },
  {
    key: 'mod+/',
    description: 'Show keyboard shortcuts',
    category: 'Global',
    action: 'showShortcuts',
  },
  {
    key: 'mod+,',
    description: 'Open settings',
    category: 'Global',
    action: 'openSettings',
  },
  {
    key: 'escape',
    description: 'Close modal/drawer',
    category: 'Global',
    action: 'closeModal',
  },

  // Session shortcuts
  {
    key: 'mod+n',
    description: 'New session',
    category: 'Sessions',
    action: 'newSession',
  },
  {
    key: 'mod+shift+m',
    description: 'Open sessions menu',
    category: 'Sessions',
    action: 'openSessions',
  },
  {
    key: 'mod+w',
    description: 'Close current session',
    category: 'Sessions',
    action: 'closeSession',
  },
  {
    key: 'mod+1',
    description: 'Go to session 1',
    category: 'Sessions',
    action: 'goToSession1',
  },
  {
    key: 'mod+2',
    description: 'Go to session 2',
    category: 'Sessions',
    action: 'goToSession2',
  },
  {
    key: 'mod+3',
    description: 'Go to session 3',
    category: 'Sessions',
    action: 'goToSession3',
  },

  // Chat shortcuts
  {
    key: 'enter',
    description: 'Send message',
    category: 'Chat',
    action: 'sendMessage',
  },
  {
    key: 'shift+enter',
    description: 'New line in message',
    category: 'Chat',
    action: 'newLine',
  },
  {
    key: 'mod+up',
    description: 'Edit last message',
    category: 'Chat',
    action: 'editLastMessage',
  },
  {
    key: 'mod+r',
    description: 'Regenerate response',
    category: 'Chat',
    action: 'regenerate',
  },

  // Navigation shortcuts
  {
    key: 'mod+shift+a',
    description: 'Go to analytics',
    category: 'Navigation',
    action: 'goToAnalytics',
  },
  {
    key: 'mod+h',
    description: 'Go to home',
    category: 'Navigation',
    action: 'goToHome',
  },
]

/**
 * Get shortcuts by category
 */
export function getShortcutsByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
  return KEYBOARD_SHORTCUTS.filter((shortcut) => shortcut.category === category)
}

/**
 * Get all categories
 */
export function getCategories(): KeyboardShortcut['category'][] {
  return ['Global', 'Sessions', 'Chat', 'Navigation']
}
