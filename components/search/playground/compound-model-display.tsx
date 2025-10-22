'use client'

/**
 * Compound Model Display
 *
 * Simple display for Groq Compound AI (the only model available in playground).
 * Shows model name and indicates it's using the free tier with built-in tools.
 */

import { Cpu, Sparkles, Check } from 'lucide-react'

export function CompoundModelDisplay() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-2 border-slate-600 rounded-lg text-sm font-medium text-slate-200 min-w-[220px]">
      <Cpu className="h-4 w-4 text-purple-400" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white">Groq Compound AI</span>
          <Sparkles className="h-3 w-3 text-purple-400" />
        </div>
      </div>
      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500 rounded text-[10px] font-bold text-green-400">
        <Check className="h-2.5 w-2.5" />
        FREE
      </div>
    </div>
  )
}

/**
 * Load selected model (always returns groq/compound)
 */
export function loadSelectedModel(): string {
  return 'groq/compound'
}

/**
 * Save selected model (no-op since there's only one option)
 */
export function saveSelectedModel(modelId: string): void {
  // No-op: Only one model available
}
