'use client'

/**
 * Mobile-Friendly Tab Navigation (Google-style)
 *
 * Always-visible horizontal tabs with Tools button.
 * Scrollable on mobile, fixed on desktop.
 */

import { Globe, Image, Video, MapPin, Map, Newspaper, GraduationCap, ShoppingCart, SlidersHorizontal } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'

interface MobileTabsProps {
  activeTab: SerperSearchType
  onTabChange: (tab: SerperSearchType) => void
  onToolsClick: () => void
  showToolsIndicator?: boolean // Show badge if filters are active
}

interface TabConfig {
  type: SerperSearchType
  label: string
  icon: React.ElementType
}

const TABS: TabConfig[] = [
  { type: 'search', label: 'All', icon: Globe },
  { type: 'images', label: 'Images', icon: Image },
  { type: 'videos', label: 'Videos', icon: Video },
  { type: 'news', label: 'News', icon: Newspaper },
  { type: 'places', label: 'Places', icon: MapPin },
  { type: 'maps', label: 'Maps', icon: Map },
  { type: 'scholar', label: 'Scholar', icon: GraduationCap },
  { type: 'shopping', label: 'Shopping', icon: ShoppingCart },
]

export function MobileTabs({ activeTab, onTabChange, onToolsClick, showToolsIndicator = false }: MobileTabsProps) {
  return (
    <div className="border-b-2 border-black bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Scrollable tab container */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {/* Search type tabs */}
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.type

            return (
              <button
                key={tab.type}
                onClick={() => onTabChange(tab.type)}
                className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] flex-shrink-0 ${
                  isActive
                    ? 'border-black text-gray-900 -mb-0.5'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}

          {/* Tools button (Google-style) */}
          <button
            onClick={onToolsClick}
            className="px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap min-h-[44px] flex-shrink-0 relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Tools
            {/* Active filters indicator */}
            {showToolsIndicator && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-black rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
