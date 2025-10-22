'use client'

/**
 * JSON Viewer Component
 *
 * Displays search results as formatted JSON with syntax highlighting,
 * collapsible tree structure, and copy/export functionality.
 */

import React, { useState } from 'react'
import { Copy, Download, Check, ChevronDown, ChevronRight, Braces } from 'lucide-react'
import { toast } from 'sonner'

interface JsonViewerProps {
  data: any
  title?: string
}

export function JsonViewer({ data, title = 'Search Results' }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([]))

  // Pretty-print JSON
  const jsonString = JSON.stringify(data, null, 2)

  /**
   * Copy JSON to clipboard
   */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  /**
   * Download JSON as file
   */
  function handleDownload() {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded JSON file')
  }

  /**
   * Toggle expansion of a JSON path
   */
  function togglePath(path: string) {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedPaths(newExpanded)
  }

  /**
   * Render JSON value with syntax highlighting
   */
  function renderValue(value: any, key: string, path: string, level: number): React.ReactElement {
    const indent = level * 20

    // Null
    if (value === null) {
      return (
        <div className="flex items-start" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-purple-600 font-semibold">{key}: </span>
          <span className="text-gray-400 ml-2">null</span>
        </div>
      )
    }

    // Boolean
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-start" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-purple-600 font-semibold">{key}: </span>
          <span className="text-orange-600 ml-2">{value.toString()}</span>
        </div>
      )
    }

    // Number
    if (typeof value === 'number') {
      return (
        <div className="flex items-start" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-purple-600 font-semibold">{key}: </span>
          <span className="text-blue-600 ml-2">{value}</span>
        </div>
      )
    }

    // String
    if (typeof value === 'string') {
      return (
        <div className="flex items-start" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-purple-600 font-semibold">{key}: </span>
          <span className="text-green-600 ml-2">"{value}"</span>
        </div>
      )
    }

    // Array
    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path)
      return (
        <div style={{ paddingLeft: `${indent}px` }}>
          <button
            onClick={() => togglePath(path)}
            className="flex items-center gap-1 hover:bg-gray-100 rounded px-1 -ml-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
            <span className="text-purple-600 font-semibold">{key}: </span>
            <span className="text-gray-600 ml-1">[{value.length} items]</span>
          </button>
          {isExpanded && (
            <div className="mt-1">
              {value.map((item, index) =>
                renderValue(item, `[${index}]`, `${path}[${index}]`, level + 1)
              )}
            </div>
          )}
        </div>
      )
    }

    // Object
    if (typeof value === 'object') {
      const isExpanded = expandedPaths.has(path)
      const keys = Object.keys(value)
      return (
        <div style={{ paddingLeft: `${indent}px` }}>
          <button
            onClick={() => togglePath(path)}
            className="flex items-center gap-1 hover:bg-gray-100 rounded px-1 -ml-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
            <span className="text-purple-600 font-semibold">{key}: </span>
            <span className="text-gray-600 ml-1">{`{${keys.length} keys}`}</span>
          </button>
          {isExpanded && (
            <div className="mt-1">
              {keys.map((k) => renderValue(value[k], k, `${path}.${k}`, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return <div>Unknown type</div>
  }

  return (
    <div className="border-2 border-black rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-black px-4 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <Braces className="h-5 w-5 text-gray-900" />
          <h3 className="font-bold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">
            {jsonString.split('\n').length} lines, {jsonString.length.toLocaleString()} chars
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label="Copy JSON"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="hidden md:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden md:inline">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            aria-label="Download JSON"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>

      {/* JSON Content - Collapsible Tree */}
      <div className="p-4 overflow-auto max-h-[600px] font-mono text-sm">
        {data && typeof data === 'object' ? (
          <div className="space-y-1">
            {Object.keys(data).map((key) => renderValue(data[key], key, key, 0))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
        )}
      </div>

      {/* Footer - Stats */}
      <div className="border-t-2 border-black px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
        <span>
          Total size: {(new Blob([jsonString]).size / 1024).toFixed(2)} KB
        </span>
        <button
          onClick={() => {
            if (expandedPaths.size > 0) {
              setExpandedPaths(new Set())
            } else {
              // Expand all top-level keys
              const allPaths = new Set<string>()
              Object.keys(data).forEach((key) => allPaths.add(key))
              setExpandedPaths(allPaths)
            }
          }}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          {expandedPaths.size > 0 ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
    </div>
  )
}
