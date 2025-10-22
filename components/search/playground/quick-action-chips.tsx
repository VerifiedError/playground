'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react'
import type { QuickAction } from '@/lib/ai-chat-quick-actions'
import { deleteQuickAction } from '@/lib/ai-chat-quick-actions'

interface QuickActionChipsProps {
  actions: QuickAction[]
  onActionClick: (prompt: string) => void
  onActionsChange?: () => void // Callback when actions are deleted
  disabled?: boolean
}

export function QuickActionChips({
  actions,
  onActionClick,
  onActionsChange,
  disabled = false,
}: QuickActionChipsProps) {
  const [expanded, setExpanded] = useState(true)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (actions.length === 0) {
    return (
      <div className="border-b-2 border-slate-700 bg-slate-900/50 px-2 py-1 md:px-6 md:py-3">
        <div className="text-center py-2 md:py-4">
          <p className="text-xs md:text-sm text-slate-400 mb-1 md:mb-2">No quick actions available</p>
          <p className="text-[10px] md:text-xs text-slate-500">
            All actions have been deleted for this search type.
          </p>
        </div>
      </div>
    )
  }

  const handleDelete = async (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the action

    if (
      !confirm(
        'Delete this quick action permanently? You can restore all actions using the refresh button.'
      )
    ) {
      return
    }

    setDeletingId(actionId)

    // Delete from localStorage
    deleteQuickAction(actionId)

    // Small delay for visual feedback
    setTimeout(() => {
      setDeletingId(null)

      // Notify parent to refresh actions
      if (onActionsChange) {
        onActionsChange()
      }
    }, 150)
  }

  return (
    <div className="border-b-2 border-slate-700 bg-slate-900/50 px-2 py-1 md:px-6 md:py-3">
      {/* Header - Compact on Mobile */}
      <div className="flex items-center justify-between mb-1 md:mb-2">
        <div className="flex items-center gap-1 md:gap-2">
          <Sparkles className="h-2.5 w-2.5 md:h-4 md:w-4 text-purple-400" />
          <span className="text-[10px] md:text-sm font-medium text-slate-300">Quick Actions</span>
          <span className="text-[9px] md:text-xs text-slate-500">({actions.length})</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-0.5 md:p-1 hover:bg-slate-800 rounded transition-colors"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <ChevronUp className="h-2.5 w-2.5 md:h-4 md:w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-2.5 w-2.5 md:h-4 md:w-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Quick Action Chips - Smaller on Mobile */}
      {expanded && (
        <div className="flex flex-wrap gap-1 md:gap-2">
          {actions.map((action) => (
            <div key={action.id} className="relative group/chip">
              {/* Main Action Button */}
              <button
                onClick={() => onActionClick(action.prompt)}
                onMouseEnter={() => setShowTooltip(action.id)}
                onMouseLeave={() => setShowTooltip(null)}
                disabled={disabled || deletingId === action.id}
                className={`
                  relative px-1.5 py-0.5 pr-4 md:px-3 md:py-1.5 md:pr-7
                  bg-slate-800 hover:bg-slate-700
                  border border-slate-600 md:border-2 hover:border-purple-500
                  rounded md:rounded-lg transition-all text-[10px] md:text-sm font-medium
                  text-slate-200 hover:text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:bg-slate-800 disabled:hover:border-slate-600
                  flex items-center gap-0.5 md:gap-1.5
                  ${deletingId === action.id ? 'opacity-50 scale-95' : ''}
                `}
                title={action.description}
              >
                <span>{action.label}</span>

                {/* Delete Button (Inline) */}
                <button
                  onClick={(e) => handleDelete(action.id, e)}
                  disabled={disabled}
                  className="
                    absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2
                    p-0.5 rounded
                    bg-slate-900/0 hover:bg-red-500/20
                    border border-slate-600/0 hover:border-red-500
                    opacity-0 group-hover/chip:opacity-100
                    sm:opacity-100
                    transition-all
                    disabled:opacity-0
                  "
                  title="Delete this action permanently"
                >
                  <X className="h-2 w-2 md:h-3 md:w-3 text-slate-400 hover:text-red-400" />
                </button>
              </button>

              {/* Tooltip - Hidden on Mobile */}
              {showTooltip === action.id && action.description && (
                <div className="hidden md:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-950 border-2 border-purple-500 rounded-lg text-xs text-slate-200 whitespace-nowrap shadow-lg pointer-events-none">
                  {action.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Footer - Hidden on Mobile */}
      {expanded && (
        <div className="hidden md:block mt-3 pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-red-400">×</span>
            <span>
              Hover over actions to delete them permanently. Deleted actions stay hidden until you
              reset.
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
