/**
 * Playground Template Settings V2
 *
 * Settings interface and defaults for playground template selection.
 * Supports 5 mobile and 5 desktop template options with localStorage persistence.
 * Replaces the original playground-template-settings.ts with brand new templates.
 */

export type MobilePlaygroundTemplate =
  | 'focus-mode'
  | 'stacked-cards'
  | 'timeline-view'
  | 'zen-mode'
  | 'power-user'

export type DesktopPlaygroundTemplate =
  | 'ide-style'
  | 'research-mode'
  | 'dashboard-layout'
  | 'floating-workspace'
  | 'cinematic-mode'

export type BubbleStyle = 'rounded' | 'sharp'

export interface PlaygroundTemplateSettings {
  // Mobile Template Selection
  mobileTemplate: MobilePlaygroundTemplate

  // Desktop Template Selection
  desktopTemplate: DesktopPlaygroundTemplate

  // Template-Specific Options
  mobileShowTimestamps: boolean // Show message timestamps on mobile
  desktopShowRightPanel: boolean // Show right context panel on desktop
  bubbleStyle: BubbleStyle // Message bubble style (rounded/sharp)
  animateMessages: boolean // Smooth message animations
  compactMode: boolean // Compact message spacing
  enableGestures: boolean // Swipe gestures on mobile
  autoHideUI: boolean // Auto-hide UI elements
}

export const DEFAULT_PLAYGROUND_TEMPLATE_SETTINGS: PlaygroundTemplateSettings = {
  mobileTemplate: 'focus-mode',
  desktopTemplate: 'ide-style',
  mobileShowTimestamps: false,
  desktopShowRightPanel: true,
  bubbleStyle: 'rounded',
  animateMessages: true,
  compactMode: false,
  enableGestures: true,
  autoHideUI: false,
}

const STORAGE_KEY = 'playground-template-settings-v2'
const OLD_STORAGE_KEY = 'playground-template-settings' // For migration

/**
 * Migrate from old template settings to new v2 settings
 */
function migrateOldSettings(): PlaygroundTemplateSettings | null {
  if (typeof window === 'undefined') return null

  try {
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldStored) {
      const oldSettings = JSON.parse(oldStored)

      // Delete old storage key after reading
      localStorage.removeItem(OLD_STORAGE_KEY)

      // Return migrated settings with new defaults
      return {
        ...DEFAULT_PLAYGROUND_TEMPLATE_SETTINGS,
        mobileShowTimestamps: oldSettings.mobileShowTimestamps ?? false,
        desktopShowRightPanel: oldSettings.desktopShowRightPanel ?? true,
        bubbleStyle: oldSettings.bubbleStyle ?? 'rounded',
        animateMessages: oldSettings.animateMessages ?? true,
        compactMode: oldSettings.compactMode ?? false,
      }
    }
  } catch (error) {
    console.error('Failed to migrate old template settings:', error)
  }

  return null
}

/**
 * Load template settings from localStorage
 */
export function loadPlaygroundTemplateSettings(): PlaygroundTemplateSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_PLAYGROUND_TEMPLATE_SETTINGS
  }

  try {
    // Try to load v2 settings first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...DEFAULT_PLAYGROUND_TEMPLATE_SETTINGS,
        ...parsed,
      }
    }

    // Try to migrate from old settings
    const migrated = migrateOldSettings()
    if (migrated) {
      // Save migrated settings
      savePlaygroundTemplateSettings(migrated)
      return migrated
    }
  } catch (error) {
    console.error('Failed to load playground template settings:', error)
  }

  return DEFAULT_PLAYGROUND_TEMPLATE_SETTINGS
}

/**
 * Save template settings to localStorage
 */
export function savePlaygroundTemplateSettings(settings: PlaygroundTemplateSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save playground template settings:', error)
  }
}

/**
 * Template metadata for UI display
 */
export interface TemplateInfo {
  id: string
  name: string
  icon: string
  description: string
  bestFor: string
}

export const MOBILE_PLAYGROUND_TEMPLATES: Record<MobilePlaygroundTemplate, TemplateInfo> = {
  'focus-mode': {
    id: 'focus-mode',
    name: 'Focus Mode',
    icon: '🧘',
    description: 'Full-screen minimalist with gesture controls',
    bestFor: 'Distraction-free chat',
  },
  'stacked-cards': {
    id: 'stacked-cards',
    name: 'Stacked Cards',
    icon: '📚',
    description: 'Card-based conversations with swipe actions',
    bestFor: 'Visual organization',
  },
  'timeline-view': {
    id: 'timeline-view',
    name: 'Timeline View',
    icon: '⏱️',
    description: 'Vertical timeline with branching conversations',
    bestFor: 'Long conversations, history tracking',
  },
  'zen-mode': {
    id: 'zen-mode',
    name: 'Zen Mode',
    icon: '🌙',
    description: 'Ultra-minimal with hidden UI, reveal on tap',
    bestFor: 'Immersive experience',
  },
  'power-user': {
    id: 'power-user',
    name: 'Power User',
    icon: '⚡',
    description: 'Compact with shortcuts toolbar and command palette',
    bestFor: 'Efficiency, multitasking',
  },
}

export const DESKTOP_PLAYGROUND_TEMPLATES: Record<DesktopPlaygroundTemplate, TemplateInfo> = {
  'ide-style': {
    id: 'ide-style',
    name: 'IDE Style',
    icon: '💻',
    description: 'VS Code-inspired multi-panel workspace',
    bestFor: 'Developers, power users',
  },
  'research-mode': {
    id: 'research-mode',
    name: 'Research Mode',
    icon: '📖',
    description: 'Document-centric ultra-wide layout',
    bestFor: 'Long-form writing, research',
  },
  'dashboard-layout': {
    id: 'dashboard-layout',
    name: 'Dashboard Layout',
    icon: '🎛️',
    description: 'Widget-based dashboard with stats and tools',
    bestFor: 'Monitoring, analytics',
  },
  'floating-workspace': {
    id: 'floating-workspace',
    name: 'Floating Workspace',
    icon: '🪟',
    description: 'Draggable, dockable panels like Figma',
    bestFor: 'Multi-tasking, multi-chat',
  },
  'cinematic-mode': {
    id: 'cinematic-mode',
    name: 'Cinematic Mode',
    icon: '🎬',
    description: 'Ultra-wide centered with ambient gradients',
    bestFor: 'Presentations, focus',
  },
}
