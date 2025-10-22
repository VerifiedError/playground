'use client'

import { Home, TrendingUp, Library, Settings, MessageSquare } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Height constant for layout calculations (56px min-height + 8px padding + safe area)
export const BOTTOM_NAV_HEIGHT = 72

interface BottomNavProps {
  onHomeClick: () => void
  onAnalyticsClick: () => void
  onLibraryClick: () => void
  onSettingsClick: () => void
  onSessionsClick: () => void
  unreadCount?: number
}

export function BottomNav({
  onHomeClick,
  onAnalyticsClick,
  onLibraryClick,
  onSettingsClick,
  onSessionsClick,
  unreadCount = 0,
}: BottomNavProps) {
  const pathname = usePathname()

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: onHomeClick,
      active: pathname === '/',
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: MessageSquare,
      onClick: onSessionsClick,
      active: false, // Sessions is a drawer, not a route
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      onClick: onAnalyticsClick,
      active: pathname === '/analytics',
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library,
      onClick: onLibraryClick,
      active: false, // Library is a modal, not a route
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: onSettingsClick,
      active: false, // Settings is a modal, not a route
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-h-[56px] min-w-[64px] relative ${
                tab.active
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={tab.label}
              aria-current={tab.active ? 'page' : undefined}
            >
              <Icon className={`h-6 w-6 ${tab.active ? 'text-white' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${tab.active ? 'text-white' : 'text-gray-600'}`}>
                {tab.label}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
