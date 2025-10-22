'use client'

/**
 * Search Tabs Component
 *
 * Tabs for different search types: Web, Images, Videos, etc.
 */

import { Globe, Image, Video, MapPin, Map, Newspaper, GraduationCap, ShoppingCart } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'

interface SearchTabsProps {
  activeTab: SerperSearchType
  onTabChange: (tab: SerperSearchType) => void
}

interface TabConfig {
  type: SerperSearchType
  label: string
  icon: React.ElementType
}

const TABS: TabConfig[] = [
  { type: 'search', label: 'Web', icon: Globe },
  { type: 'images', label: 'Images', icon: Image },
  { type: 'videos', label: 'Videos', icon: Video },
  { type: 'places', label: 'Places', icon: MapPin },
  { type: 'maps', label: 'Maps', icon: Map },
  { type: 'news', label: 'News', icon: Newspaper },
  { type: 'scholar', label: 'Scholar', icon: GraduationCap },
  { type: 'shopping', label: 'Shopping', icon: ShoppingCart },
]

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.type

        return (
          <button
            key={tab.type}
            onClick={() => onTabChange(tab.type)}
            className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              isActive
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
