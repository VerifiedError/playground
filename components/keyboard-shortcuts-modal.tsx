'use client'

import { X, Command, Keyboard } from 'lucide-react'
import { formatShortcut, getModifierKey, type KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

interface ShortcutGroup {
  name: string
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  // Group shortcuts by category (inferred from description)
  const groupedShortcuts: ShortcutGroup[] = [
    {
      name: 'General',
      shortcuts: shortcuts.filter((s) =>
        s.description.match(/^(New|Close|Open|Search|Help)/i)
      ),
    },
    {
      name: 'Chat',
      shortcuts: shortcuts.filter((s) =>
        s.description.match(/(Send|Message|Edit|Regenerate)/i)
      ),
    },
    {
      name: 'Navigation',
      shortcuts: shortcuts.filter((s) =>
        s.description.match(/(Session|Switch|Next|Previous)/i)
      ),
    },
    {
      name: 'Settings',
      shortcuts: shortcuts.filter((s) =>
        s.description.match(/(Settings|Model|Toggle)/i)
      ),
    },
  ].filter((group) => group.shortcuts.length > 0)

  // If no groups matched, put all in "Other"
  const categorized = groupedShortcuts.flatMap((g) => g.shortcuts)
  const uncategorized = shortcuts.filter((s) => !categorized.includes(s))
  if (uncategorized.length > 0) {
    groupedShortcuts.push({
      name: 'Other',
      shortcuts: uncategorized,
    })
  }

  const modifierKey = getModifierKey()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-lg border-2 border-black shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600">
                Available shortcuts for faster navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {groupedShortcuts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No keyboard shortcuts available
            </div>
          ) : (
            <div className="space-y-6">
              {groupedShortcuts.map((group) => (
                <div key={group.name}>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    {group.name}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {formatShortcut(shortcut)
                            .split('+')
                            .map((key, i, arr) => (
                              <div key={i} className="flex items-center gap-1">
                                <kbd className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 bg-white border-2 border-black rounded text-xs font-semibold text-gray-900">
                                  {key === 'Cmd' || key === 'Ctrl' ? (
                                    <Command className="w-3 h-3" />
                                  ) : (
                                    key
                                  )}
                                </kbd>
                                {i < arr.length - 1 && (
                                  <span className="text-gray-400 text-xs">+</span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-black bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Platform: {modifierKey === 'Cmd' ? 'macOS' : 'Windows/Linux'}
            </p>
            <div className="flex items-center gap-2">
              <kbd className="inline-flex items-center justify-center min-w-[32px] h-6 px-2 bg-white border-2 border-black rounded text-xs font-semibold text-gray-900">
                {modifierKey === 'Cmd' ? <Command className="w-3 h-3" /> : 'Ctrl'}
              </kbd>
              <span className="text-xs text-gray-600">+</span>
              <kbd className="inline-flex items-center justify-center min-w-[32px] h-6 px-2 bg-white border-2 border-black rounded text-xs font-semibold text-gray-900">
                /
              </kbd>
              <span className="text-xs text-gray-600 ml-2">to open this menu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
