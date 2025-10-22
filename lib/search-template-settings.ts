/**
 * Search Template Settings
 *
 * Settings interface and defaults for search template selection.
 * Supports 15 mobile and 5 desktop template options with localStorage persistence.
 */

export type MobileSearchTemplate =
  | 'command-center'
  | 'card-swipe'
  | 'infinite-feed'
  | 'split-view'
  | 'compact-grid'
  | 'magazine-layout'
  | 'timeline-view'
  | 'kanban-board'
  | 'pinterest-masonry'
  | 'chat-bubbles'
  | 'map-first'
  | 'spreadsheet-table'
  | 'gallery-carousel'
  | 'minimal-list'
  | 'action-sheets'

export type DesktopSearchTemplate =
  | 'research-hub'
  | 'dashboard-view'
  | 'split-screen'
  | 'floating-panels'
  | 'minimal-focus'

export interface SearchTemplateSettings {
  // Mobile Template Selection
  mobileTemplate: MobileSearchTemplate

  // Desktop Template Selection
  desktopTemplate: DesktopSearchTemplate

  // Template-Specific Options
  enableGestures: boolean // Swipe gestures on mobile
  showAnimations: boolean // Smooth animations
  compactMode: boolean // Compact spacing
  autoHideUI: boolean // Auto-hide chrome elements
}

export const DEFAULT_SEARCH_TEMPLATE_SETTINGS: SearchTemplateSettings = {
  mobileTemplate: 'command-center',
  desktopTemplate: 'research-hub',
  enableGestures: true,
  showAnimations: true,
  compactMode: false,
  autoHideUI: false,
}

const STORAGE_KEY = 'search-template-settings'

/**
 * Load template settings from localStorage
 */
export function loadSearchTemplateSettings(): SearchTemplateSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SEARCH_TEMPLATE_SETTINGS
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...DEFAULT_SEARCH_TEMPLATE_SETTINGS,
        ...parsed,
      }
    }
  } catch (error) {
    console.error('Failed to load search template settings:', error)
  }

  return DEFAULT_SEARCH_TEMPLATE_SETTINGS
}

/**
 * Save template settings to localStorage
 */
export function saveSearchTemplateSettings(settings: SearchTemplateSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save search template settings:', error)
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

export const MOBILE_SEARCH_TEMPLATES: Record<MobileSearchTemplate, TemplateInfo> = {
  'command-center': {
    id: 'command-center',
    name: 'Command Center',
    icon: '⌘',
    description: 'Command palette with keyboard shortcuts and quick actions',
    bestFor: 'Power users, keyboard navigation',
  },
  'card-swipe': {
    id: 'card-swipe',
    name: 'Card Swipe',
    icon: '📇',
    description: 'Tinder-style swipeable cards for quick browsing',
    bestFor: 'Quick browsing, one-handed use',
  },
  'infinite-feed': {
    id: 'infinite-feed',
    name: 'Infinite Feed',
    icon: '∞',
    description: 'Instagram-style infinite scroll with pull-to-refresh',
    bestFor: 'Casual browsing, exploration',
  },
  'split-view': {
    id: 'split-view',
    name: 'Split View',
    icon: '⫴',
    description: 'Dual-pane with filters and results side-by-side',
    bestFor: 'Advanced filtering, comparison',
  },
  'compact-grid': {
    id: 'compact-grid',
    name: 'Compact Grid',
    icon: '⊞',
    description: 'Pinterest-style masonry grid for visual content',
    bestFor: 'Visual content (images, videos, shopping)',
  },
  'magazine-layout': {
    id: 'magazine-layout',
    name: 'Magazine Layout',
    icon: '📰',
    description: 'Article-style results with large images and pull-to-refresh',
    bestFor: 'News, scholar, shopping with rich visuals',
  },
  'timeline-view': {
    id: 'timeline-view',
    name: 'Timeline View',
    icon: '🕒',
    description: 'Chronological vertical timeline with date markers',
    bestFor: 'News, scholar, date-filtered searches',
  },
  'kanban-board': {
    id: 'kanban-board',
    name: 'Kanban Board',
    icon: '📋',
    description: 'Horizontal scrolling columns for result organization',
    bestFor: 'Research workflows and result organization',
  },
  'pinterest-masonry': {
    id: 'pinterest-masonry',
    name: 'Pinterest Masonry',
    icon: '🖼️',
    description: 'Masonry grid layout with varied card heights',
    bestFor: 'Images, videos, shopping with rich visuals',
  },
  'chat-bubbles': {
    id: 'chat-bubbles',
    name: 'Chat Bubbles',
    icon: '💬',
    description: 'Conversational result display as chat messages',
    bestFor: 'Casual browsing with fun messaging-app UX',
  },
  'map-first': {
    id: 'map-first',
    name: 'Map First',
    icon: '🗺️',
    description: '50/50 split between map and list view',
    bestFor: 'Places and maps searches with geolocation',
  },
  'spreadsheet-table': {
    id: 'spreadsheet-table',
    name: 'Spreadsheet Table',
    icon: '📊',
    description: 'Compact table view with sortable columns',
    bestFor: 'Scholar, shopping comparisons, structured data',
  },
  'gallery-carousel': {
    id: 'gallery-carousel',
    name: 'Gallery Carousel',
    icon: '🎠',
    description: 'Full-width image slider with navigation',
    bestFor: 'Images and product searches',
  },
  'minimal-list': {
    id: 'minimal-list',
    name: 'Minimal List',
    icon: '📝',
    description: 'Ultra-compact text-only list',
    bestFor: 'Slow connections, quick browsing',
  },
  'action-sheets': {
    id: 'action-sheets',
    name: 'Action Sheets',
    icon: '⚡',
    description: 'Bottom sheet overlays with swipe gestures',
    bestFor: 'Mobile-native experience with gestures',
  },
}

export const DESKTOP_SEARCH_TEMPLATES: Record<DesktopSearchTemplate, TemplateInfo> = {
  'research-hub': {
    id: 'research-hub',
    name: 'Research Hub',
    icon: '🔬',
    description: 'Three-panel workspace with filters, results, and preview',
    bestFor: 'Deep research, academic use',
  },
  'dashboard-view': {
    id: 'dashboard-view',
    name: 'Dashboard View',
    icon: '📈',
    description: 'Analytics dashboard with stats cards and charts',
    bestFor: 'Data analysis, reporting',
  },
  'split-screen': {
    id: 'split-screen',
    name: 'Split Screen',
    icon: '⌘',
    description: 'Vertical split with visual/JSON dual view',
    bestFor: 'Developers, debugging',
  },
  'floating-panels': {
    id: 'floating-panels',
    name: 'Floating Panels',
    icon: '🎛️',
    description: 'VS Code-style draggable and dockable panels',
    bestFor: 'Custom workflows, multi-monitor',
  },
  'minimal-focus': {
    id: 'minimal-focus',
    name: 'Minimal Focus',
    icon: '◉',
    description: 'Centered single-column distraction-free layout',
    bestFor: 'Focused reading, accessibility',
  },
}
