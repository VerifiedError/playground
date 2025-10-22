'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Cpu, Zap, Sparkles } from 'lucide-react'

export interface AIModel {
  id: string
  name: string
  description: string
  speed: 'fast' | 'medium' | 'slow'
  quality: 'good' | 'better' | 'best'
  costPerMillion: { input: number; output: number }
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B (Fast)',
    description: 'Fast and efficient, great for quick responses',
    speed: 'fast',
    quality: 'good',
    costPerMillion: { input: 0.05, output: 0.08 },
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Balanced)',
    description: 'Best balance of speed and quality',
    speed: 'medium',
    quality: 'better',
    costPerMillion: { input: 0.59, output: 0.79 },
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (High Quality)',
    description: 'High quality responses with large context',
    speed: 'medium',
    quality: 'best',
    costPerMillion: { input: 0.24, output: 0.24 },
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B (Efficient)',
    description: 'Google model, efficient and accurate',
    speed: 'fast',
    quality: 'better',
    costPerMillion: { input: 0.20, output: 0.20 },
  },
]

interface AIModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

export function AIModelSelector({ selectedModel, onModelChange, disabled = false }: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0]

  // Close dropdown when clicking outside
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

  const getSpeedIcon = (speed: string) => {
    if (speed === 'fast') return <Zap className="h-3 w-3 text-green-400" />
    if (speed === 'medium') return <Cpu className="h-3 w-3 text-yellow-400" />
    return <Sparkles className="h-3 w-3 text-purple-400" />
  }

  const getSpeedColor = (speed: string) => {
    if (speed === 'fast') return 'text-green-400'
    if (speed === 'medium') return 'text-yellow-400'
    return 'text-purple-400'
  }

  const getQualityBadge = (quality: string) => {
    const colors = {
      good: 'bg-slate-700 text-slate-300',
      better: 'bg-blue-900/50 text-blue-300',
      best: 'bg-purple-900/50 text-purple-300',
    }
    return colors[quality as keyof typeof colors] || colors.good
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg transition-all text-sm font-medium text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 min-w-[220px]"
        title="Select AI model"
      >
        <Cpu className="h-4 w-4 text-purple-400" />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-white">{currentModel.name}</span>
            {getSpeedIcon(currentModel.speed)}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 bg-slate-800 border-b-2 border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Select AI Model</p>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors border-l-4 ${
                  model.id === selectedModel
                    ? 'border-purple-500 bg-slate-800/50'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{model.name}</span>
                      {getSpeedIcon(model.speed)}
                      <span className={`text-xs ${getSpeedColor(model.speed)}`}>
                        {model.speed}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{model.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getQualityBadge(model.quality)}`}>
                        {model.quality}
                      </span>
                      <span className="text-xs text-slate-500">
                        ${model.costPerMillion.input}/${model.costPerMillion.output} per 1M tokens
                      </span>
                    </div>
                  </div>

                  {model.id === selectedModel && (
                    <div className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="px-4 py-2 bg-slate-800 border-t-2 border-slate-700 text-xs text-slate-400">
            <p>💡 Tip: Faster models respond quicker but may have lower quality. Choose based on your needs.</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * LocalStorage key for selected model
 */
const SELECTED_MODEL_KEY = 'ai-chat-selected-model'

/**
 * Load selected model from localStorage
 */
export function loadSelectedModel(): string {
  if (typeof window === 'undefined') return AVAILABLE_MODELS[0].id

  try {
    const stored = localStorage.getItem(SELECTED_MODEL_KEY)
    if (stored && AVAILABLE_MODELS.some((m) => m.id === stored)) {
      return stored
    }
  } catch (error) {
    console.error('Failed to load selected model:', error)
  }

  return AVAILABLE_MODELS[0].id
}

/**
 * Save selected model to localStorage
 */
export function saveSelectedModel(modelId: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SELECTED_MODEL_KEY, modelId)
  } catch (error) {
    console.error('Failed to save selected model:', error)
  }
}
