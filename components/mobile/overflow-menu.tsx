'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MoreVertical,
  Shield,
  BookOpen,
  Sparkles,
  Plus,
  LogOut,
  User,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

interface OverflowMenuProps {
  isAdmin: boolean
  onAdminClick?: () => void
  onTemplatesClick?: () => void
  onOptimizeClick?: () => void
  onNewChatClick?: () => void
  username?: string
}

export function OverflowMenu({
  isAdmin,
  onAdminClick,
  onTemplatesClick,
  onOptimizeClick,
  onNewChatClick,
  username,
}: OverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login' })
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const menuItems = [
    {
      label: 'New Chat',
      icon: Plus,
      onClick: () => {
        onNewChatClick?.()
        setIsOpen(false)
      },
      show: true,
    },
    {
      label: 'Templates',
      icon: BookOpen,
      onClick: () => {
        onTemplatesClick?.()
        setIsOpen(false)
      },
      show: true,
    },
    {
      label: 'Optimize Prompt',
      icon: Sparkles,
      onClick: () => {
        onOptimizeClick?.()
        setIsOpen(false)
      },
      show: true,
    },
    {
      label: 'Admin Dashboard',
      icon: Shield,
      onClick: () => {
        onAdminClick?.()
        setIsOpen(false)
      },
      show: isAdmin,
      highlight: true,
    },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreVertical className="h-5 w-5 text-gray-900" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border-2 border-black shadow-xl z-50 overflow-hidden">
            {/* User Info */}
            {username && (
              <div className="px-4 py-3 border-b-2 border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
              {menuItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors min-h-[44px] ${
                        item.highlight
                          ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${item.highlight ? 'text-purple-600' : 'text-gray-600'}`} />
                      <span className="text-base font-medium">{item.label}</span>
                    </button>
                  )
                })}
            </div>

            {/* Sign Out */}
            <div className="border-t-2 border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-base font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
