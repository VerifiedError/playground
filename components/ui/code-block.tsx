'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  language?: string
  value: string
  inline?: boolean
}

export function CodeBlock({ language, value, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Inline code (single backticks)
  if (inline) {
    return (
      <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 rounded border border-gray-300 font-mono text-sm">
        {value}
      </code>
    )
  }

  // Detect language from className (e.g., "language-javascript")
  const detectedLanguage = language?.replace(/language-/, '') || 'text'

  // Code block (triple backticks)
  return (
    <div className="relative group my-4">
      {/* Language Badge & Copy Button */}
      <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-2 rounded-t-lg border-2 border-black border-b-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
          {detectedLanguage}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600 transition-colors text-xs font-medium min-h-[32px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Content with Syntax Highlighting */}
      <div className="rounded-b-lg border-2 border-black border-t-0 overflow-hidden">
        <SyntaxHighlighter
          language={detectedLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: '#1e1e1e',
            borderRadius: 0,
          }}
          showLineNumbers={value.split('\n').length > 3}
          wrapLines={true}
          wrapLongLines={true}
        >
          {value.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
