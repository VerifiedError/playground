'use client'

import { useState } from 'react'
import JsonView from '@uiw/react-json-view'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface JsonViewerProps {
  data: any
}

// Dark theme for JSON viewer (matching Serper playground)
const darkTheme = {
  '--w-rjv-color': '#9cdcfe',
  '--w-rjv-key-number': '#268bd2',
  '--w-rjv-key-string': '#9cdcfe',
  '--w-rjv-background-color': '#0a0d14',
  '--w-rjv-line-color': '#36334280',
  '--w-rjv-arrow-color': '#838383',
  '--w-rjv-edit-color': '#9cdcfe',
  '--w-rjv-info-color': '#9c9c9c7a',
  '--w-rjv-update-color': '#9cdcfe',
  '--w-rjv-copied-color': '#9cdcfe',
  '--w-rjv-copied-success-color': '#28a745',
  '--w-rjv-curlybraces-color': '#d4d4d4',
  '--w-rjv-colon-color': '#d4d4d4',
  '--w-rjv-brackets-color': '#d4d4d4',
  '--w-rjv-ellipsis-color': '#cb4b16',
  '--w-rjv-quotes-color': '#ce9178',
  '--w-rjv-quotes-string-color': '#ce9178',
  '--w-rjv-type-string-color': '#ce9178',
  '--w-rjv-type-int-color': '#b5cea8',
  '--w-rjv-type-float-color': '#b5cea8',
  '--w-rjv-type-bigint-color': '#b5cea8',
  '--w-rjv-type-boolean-color': '#569cd6',
  '--w-rjv-type-date-color': '#b5cea8',
  '--w-rjv-type-url-color': '#3b89cf',
  '--w-rjv-type-null-color': '#569cd6',
  '--w-rjv-type-nan-color': '#859900',
  '--w-rjv-type-undefined-color': '#569cd6',
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="relative h-full">
      {/* Copy Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg transition-colors flex items-center gap-2"
          title="Copy JSON"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* JSON Viewer */}
      <div className="p-6 overflow-auto h-full">
        <JsonView
          value={data}
          keyName="root"
          collapsed={2}
          displayDataTypes={false}
          style={{
            ...darkTheme,
            fontSize: '13px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            lineHeight: '1.6',
          }}
        />
      </div>
    </div>
  )
}
