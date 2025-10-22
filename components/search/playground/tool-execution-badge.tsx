'use client'

/**
 * Tool Execution Badge Component
 *
 * Displays which Groq Compound tools were used to generate a response.
 * Shows badges for each tool with icons and descriptions.
 */

import { Globe, Code, Monitor, Calculator, ExternalLink } from 'lucide-react'

interface ToolExecutionBadgeProps {
  executedTools?: string[]
  compact?: boolean
}

const TOOL_INFO: Record<string, { icon: any; label: string; color: string; description: string }> = {
  web_search: {
    icon: Globe,
    label: 'Web Search',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500',
    description: 'Searched the web for real-time information',
  },
  visit_website: {
    icon: ExternalLink,
    label: 'Visit Website',
    color: 'bg-green-500/10 text-green-700 border-green-500',
    description: 'Fetched and analyzed web page content',
  },
  browser_automation: {
    icon: Monitor,
    label: 'Browser Automation',
    color: 'bg-purple-500/10 text-purple-700 border-purple-500',
    description: 'Automated browser interactions',
  },
  code_interpreter: {
    icon: Code,
    label: 'Code Execution',
    color: 'bg-orange-500/10 text-orange-700 border-orange-500',
    description: 'Executed Python code in sandbox',
  },
  wolfram_alpha: {
    icon: Calculator,
    label: 'Wolfram Alpha',
    color: 'bg-red-500/10 text-red-700 border-red-500',
    description: 'Used computational knowledge engine',
  },
}

export function ToolExecutionBadge({ executedTools, compact = false }: ToolExecutionBadgeProps) {
  if (!executedTools || executedTools.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
      {executedTools.map((tool) => {
        const info = TOOL_INFO[tool]
        if (!info) return null

        const Icon = info.icon

        return (
          <div
            key={tool}
            className={`
              inline-flex items-center gap-1 md:gap-1.5
              px-1.5 py-0.5 md:px-2 md:py-1
              rounded-md border-2
              text-[10px] md:text-xs font-medium
              ${info.color}
              transition-all
            `}
            title={info.description}
          >
            <Icon className="h-2.5 w-2.5 md:h-3 md:w-3" />
            {!compact && <span>{info.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
