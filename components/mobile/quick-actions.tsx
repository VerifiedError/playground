'use client'

import { useState } from 'react'
import { Shield, X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions = [
    {
      id: 'check-leaks',
      label: 'Check for Leaks',
      icon: Shield,
      bgColor: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      onClick: () => {
        router.push('/check-leaks')
        setIsOpen(false)
      },
    },
  ]

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      {/* Action Buttons */}
      {isOpen && (
        <div className="mb-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`flex items-center gap-3 ${action.bgColor} ${action.hoverColor} text-white px-4 py-3 rounded-full shadow-lg transition-all w-full whitespace-nowrap`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-lg
          transition-all transform
          ${isOpen ? 'bg-gray-900 rotate-45' : 'bg-black hover:bg-gray-900'}
        `}
        aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  )
}
