'use client'

import { useState, ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'

export interface Tab {
  id: string
  label: string
  icon: typeof BarChart3
  content: ReactNode
}

interface MobileTabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function MobileTabs({ tabs, defaultTab }: MobileTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTab || tabs[0]?.id)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b-2 border-black bg-card overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === activeTabId

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`
                relative flex-1 min-w-[80px] px-3 py-3 flex flex-col items-center gap-1
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content - simplified without animations */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto overscroll-y-contain">
          {activeTab?.content}
        </div>
      </div>
    </div>
  )
}
