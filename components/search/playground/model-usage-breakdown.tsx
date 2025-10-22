'use client'

/**
 * Model Usage Breakdown Component
 *
 * Displays detailed breakdown of which models were used by Compound AI,
 * with token counts and exact cost calculations.
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Cpu, DollarSign, Clock } from 'lucide-react'

interface ModelUsage {
  model: string
  usage: {
    queue_time?: number
    prompt_tokens: number
    prompt_time?: number
    completion_tokens: number
    completion_time?: number
    total_tokens: number
    total_time?: number
  }
}

interface UsageBreakdown {
  models: ModelUsage[]
}

interface ModelUsageBreakdownProps {
  usageBreakdown?: UsageBreakdown
}

// Groq pricing (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'llama-3.2-1b-preview': { input: 0.04, output: 0.04 },
  'llama-3.2-3b-preview': { input: 0.06, output: 0.06 },
  'llama-3.2-11b-vision-preview': { input: 0.18, output: 0.18 },
  'llama-3.2-90b-vision-preview': { input: 0.90, output: 0.90 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  'gemma2-9b-it': { input: 0.20, output: 0.20 },
  'gemma-7b-it': { input: 0.07, output: 0.07 },
  // OpenAI models on Groq
  'openai/gpt-oss-120b': { input: 0.00, output: 0.00 }, // Free on Groq
  'openai/gpt-oss-20b': { input: 0.00, output: 0.00 }, // Free on Groq
}

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = MODEL_PRICING[model] || { input: 0, output: 0 }
  const inputCost = (promptTokens / 1000000) * pricing.input
  const outputCost = (completionTokens / 1000000) * pricing.output
  return inputCost + outputCost
}

function formatTime(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`
  return `${seconds.toFixed(2)}s`
}

function formatCost(cost: number): string {
  if (cost === 0) return 'Free'
  if (cost < 0.0001) return '<$0.0001'
  return `$${cost.toFixed(6)}`
}

export function ModelUsageBreakdown({ usageBreakdown }: ModelUsageBreakdownProps) {
  const [expanded, setExpanded] = useState(false)

  if (!usageBreakdown || !usageBreakdown.models || usageBreakdown.models.length === 0) {
    return null
  }

  // Calculate total cost
  const totalCost = usageBreakdown.models.reduce(
    (sum, model) => sum + calculateCost(model.model, model.usage.prompt_tokens, model.usage.completion_tokens),
    0
  )

  const totalTokens = usageBreakdown.models.reduce(
    (sum, model) => sum + model.usage.total_tokens,
    0
  )

  const totalTime = usageBreakdown.models.reduce(
    (sum, model) => sum + (model.usage.total_time || 0),
    0
  )

  return (
    <div className="mt-2 border-2 border-black rounded-lg bg-gray-50 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-2 py-1.5 md:px-3 md:py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-1.5 md:gap-2">
          <Cpu className="h-3 w-3 md:h-4 md:w-4 text-gray-700" />
          <span className="text-[10px] md:text-xs font-medium text-gray-900">
            Compound AI used {usageBreakdown.models.length} model{usageBreakdown.models.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Total Cost */}
          <div className="flex items-center gap-1">
            <DollarSign className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-600" />
            <span className="text-[10px] md:text-xs font-bold text-green-700">
              {formatCost(totalCost)}
            </span>
          </div>

          {/* Total Tokens */}
          <span className="text-[10px] md:text-xs text-gray-600">
            {totalTokens.toLocaleString()} tokens
          </span>

          {/* Expand icon */}
          {expanded ? (
            <ChevronUp className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
          )}
        </div>
      </button>

      {/* Detailed breakdown - Expandable */}
      {expanded && (
        <div className="border-t-2 border-black bg-white">
          <div className="p-2 md:p-3 space-y-2">
            {usageBreakdown.models.map((modelUsage, index) => {
              const cost = calculateCost(
                modelUsage.model,
                modelUsage.usage.prompt_tokens,
                modelUsage.usage.completion_tokens
              )

              return (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-md p-2 bg-gray-50"
                >
                  {/* Model name */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] md:text-xs font-semibold text-gray-900">
                      {modelUsage.model}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-green-700">
                      {formatCost(cost)}
                    </span>
                  </div>

                  {/* Token stats */}
                  <div className="grid grid-cols-3 gap-1.5 md:gap-2 text-[9px] md:text-[10px]">
                    <div>
                      <div className="text-gray-500">Input</div>
                      <div className="font-medium text-gray-900">
                        {modelUsage.usage.prompt_tokens.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Output</div>
                      <div className="font-medium text-gray-900">
                        {modelUsage.usage.completion_tokens.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total</div>
                      <div className="font-medium text-gray-900">
                        {modelUsage.usage.total_tokens.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Timing info */}
                  {modelUsage.usage.total_time && (
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] md:text-[10px] text-gray-600">
                      <Clock className="h-2.5 w-2.5" />
                      <span>
                        {formatTime(modelUsage.usage.total_time)}
                        {modelUsage.usage.queue_time && ` (queue: ${formatTime(modelUsage.usage.queue_time)})`}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Total summary */}
            <div className="pt-2 border-t-2 border-gray-200 flex items-center justify-between text-[10px] md:text-xs">
              <div className="flex items-center gap-2 md:gap-4">
                <div>
                  <span className="text-gray-600">Total Tokens:</span>
                  <span className="ml-1 font-bold text-gray-900">{totalTokens.toLocaleString()}</span>
                </div>
                {totalTime > 0 && (
                  <div>
                    <span className="text-gray-600">Total Time:</span>
                    <span className="ml-1 font-bold text-gray-900">{formatTime(totalTime)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="font-bold text-green-700 text-xs md:text-sm">
                  {formatCost(totalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
