'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Image, Video, MapPin, Map, Newspaper, GraduationCap, ShoppingCart, Sparkles, Shield } from 'lucide-react'
import type { SerperSearchType } from '@/lib/serper-types'

interface SearchTypeSelectorProps {
  value: SerperSearchType
  onChange: (value: SerperSearchType) => void
}

const SEARCH_TYPES: Array<{
  value: SerperSearchType
  label: string
  icon: typeof Search
}> = [
  { value: 'search', label: 'Search', icon: Search },
  { value: 'images', label: 'Images', icon: Image },
  { value: 'videos', label: 'Videos', icon: Video },
  { value: 'places', label: 'Places', icon: MapPin },
  { value: 'maps', label: 'Maps', icon: Map },
  { value: 'news', label: 'News', icon: Newspaper },
  { value: 'scholar', label: 'Scholar', icon: GraduationCap },
  { value: 'shopping', label: 'Shopping', icon: ShoppingCart },
  { value: 'playground', label: 'Playground', icon: Sparkles },
  { value: 'leakcheck', label: 'LeakCheck', icon: Shield },
]

export function SearchTypeSelector({ value, onChange }: SearchTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedType = SEARCH_TYPES.find((type) => type.value === value) || SEARCH_TYPES[0]
  const SelectedIcon = selectedType.icon

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (type: SerperSearchType) => {
    onChange(type)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white flex items-center justify-between hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SelectedIcon className="h-4 w-4 text-sky-400" />
          <span>{selectedType.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
          {SEARCH_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = type.value === value

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleSelect(type.value)}
                className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-700 transition-colors ${
                  isSelected ? 'bg-slate-700 text-sky-400' : 'text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{type.label}</span>
                {isSelected && (
                  <svg className="h-4 w-4 ml-auto text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
