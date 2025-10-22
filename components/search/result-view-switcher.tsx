'use client'

/**
 * Result View Switcher Component
 *
 * Toggle between Visual, JSON, and Split view modes for search results.
 */

import { Layout, Braces, Columns } from 'lucide-react'

export type ResultViewMode = 'visual' | 'json' | 'split'

interface ResultViewSwitcherProps {
  currentView: ResultViewMode
  onViewChange: (view: ResultViewMode) => void
}

export function ResultViewSwitcher({ currentView, onViewChange }: ResultViewSwitcherProps) {
  const views: { mode: ResultViewMode; icon: typeof Layout; label: string }[] = [
    { mode: 'visual', icon: Layout, label: 'Visual' },
    { mode: 'json', icon: Braces, label: 'JSON' },
    { mode: 'split', icon: Columns, label: 'Split' },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 mr-2">View:</span>
      <div className="inline-flex border-2 border-black rounded-lg overflow-hidden">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = currentView === view.mode

          return (
            <button
              key={view.mode}
              onClick={() => onViewChange(view.mode)}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border-r-2 border-black last:border-r-0'
              }`}
              aria-label={`${view.label} view`}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{view.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
