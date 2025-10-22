'use client'

import Link from 'next/link'
import { Settings, Shield, TrendingUp, BookOpen, Sparkles, Library, Plus, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME, APP_VERSION } from '@/lib/version'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface NavigationHeaderProps {
  isAdmin?: boolean
  onAdminClick?: () => void
  onSettingsClick?: () => void
  onTemplatesClick?: () => void
  onOptimizeClick?: () => void
  onLibraryClick?: () => void
  onNewChatClick?: () => void
  className?: string
}

export function NavigationHeader({
  isAdmin,
  onAdminClick,
  onSettingsClick,
  onTemplatesClick,
  onOptimizeClick,
  onLibraryClick,
  onNewChatClick,
  className,
}: NavigationHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4', className)}>
      {/* Left Section: Sidebar Toggle + Branding + New Chat */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-gray-900" />

        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{APP_NAME}</h1>
          <span className="text-sm text-gray-500 leading-tight">{APP_VERSION}</span>
        </div>

        <button
          onClick={onNewChatClick}
          className="px-4 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
          aria-label="Create new chat session"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Right Section: Action Buttons */}
      <nav className="flex items-center gap-2" aria-label="Primary navigation">
        {isAdmin && (
          <button
            onClick={onAdminClick}
            className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
            aria-label="Open admin dashboard"
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </button>
        )}

        <Link
          href="/analytics"
          className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
          aria-label="View analytics"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Analytics</span>
        </Link>

        <button
          onClick={onTemplatesClick}
          className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
          aria-label="Prompt templates"
        >
          <BookOpen className="h-4 w-4" />
          <span>Templates</span>
        </button>

        <button
          onClick={onOptimizeClick}
          className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
          aria-label="Optimize prompt"
        >
          <Sparkles className="h-4 w-4" />
          <span>Optimize</span>
        </button>

        <button
          onClick={onLibraryClick}
          className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
          aria-label="Prompt library"
        >
          <Library className="h-4 w-4" />
          <span>Library</span>
        </button>

        <button
          onClick={onSettingsClick}
          className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  )
}

/**
 * MobileNavigationHeader - Simplified header for mobile devices
 */
interface MobileNavigationHeaderProps {
  onSessionsClick?: () => void
  onOverflowMenuClick?: () => void
  className?: string
}

export function MobileNavigationHeader({
  onSessionsClick,
  onOverflowMenuClick,
  className,
}: MobileNavigationHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-3 py-3', className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={onSessionsClick}
          className="p-3 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Open sessions menu"
          aria-label="Open sessions menu"
        >
          <Menu className="h-5 w-5 text-gray-900" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">{APP_NAME}</h1>
          <span className="text-xs text-gray-500 leading-tight">{APP_VERSION}</span>
        </div>
      </div>
      <button
        onClick={onOverflowMenuClick}
        className="p-3 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-900"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </div>
  )
}
