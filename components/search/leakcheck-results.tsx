'use client'

import { LeakCheckSearchResponse, LeakCheckResult } from '@/lib/serper-types'
import { Shield, AlertTriangle, Clock, Database, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface LeakCheckResultsProps {
  data: LeakCheckSearchResponse
}

export function LeakCheckResults({ data }: LeakCheckResultsProps) {
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set())
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())

  // Normalize breach results to handle both API formats (source vs sources)
  const normalizedResults = data.result?.map((breach: any) => {
    // Convert singular 'source' to plural 'sources' array
    if (breach.source && !breach.sources) {
      // Normalize date field (breach_date -> date)
      const normalizedSource = {
        name: breach.source.name || 'Unknown',
        date: breach.source.date || breach.source.breach_date || 'Unknown'
      }
      return {
        ...breach,
        sources: [normalizedSource]
      }
    }
    // Ensure sources is always an array with normalized date fields
    if (!breach.sources) {
      return {
        ...breach,
        sources: []
      }
    }
    // Normalize dates in existing sources array
    const normalizedSources = breach.sources.map((src: any) => ({
      name: src.name || 'Unknown',
      date: src.date || src.breach_date || 'Unknown'
    }))
    return {
      ...breach,
      sources: normalizedSources
    }
  })

  if (!data.success || !normalizedResults || normalizedResults.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
          <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">No Breaches Found</h2>
          <p className="text-green-700">
            Good news! We didn't find any data breaches for &quot;{data.searchParameters.q}&quot;.
          </p>
          <p className="text-sm text-green-600 mt-2">
            This doesn't guarantee absolute safety. Continue practicing good security habits.
          </p>
        </div>
      </div>
    )
  }

  const togglePasswordReveal = (index: number) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFields((prev) => new Set(prev).add(fieldKey))
      setTimeout(() => {
        setCopiedFields((prev) => {
          const next = new Set(prev)
          next.delete(fieldKey)
          return next
        })
      }, 2000)
    })
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Warning Header */}
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-12 w-12 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              {data.found} {data.found === 1 ? 'Breach' : 'Breaches'} Found
            </h2>
            <p className="text-red-700 mb-2">
              Your search query &quot;{data.searchParameters.q}&quot; was found in {data.found} data{' '}
              {data.found === 1 ? 'breach' : 'breaches'}.
            </p>
            <p className="text-sm text-red-600">
              🔒 <strong>Recommended Actions:</strong> Change passwords immediately, enable 2FA, monitor
              accounts for suspicious activity, and consider using a password manager.
            </p>
          </div>
        </div>
      </div>

      {/* Breach Results */}
      <div className="space-y-4">
        {normalizedResults.map((breach: LeakCheckResult, index: number) => (
          <div key={index} className="bg-white border-2 border-black rounded-lg overflow-hidden">
            {/* Breach Header */}
            <div className="bg-gray-100 border-b-2 border-black px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Breach #{index + 1}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Database className="h-4 w-4" />
                  <span>{breach.sources.length} {breach.sources.length === 1 ? 'Source' : 'Sources'}</span>
                </div>
              </div>
            </div>

            {/* Breach Sources */}
            <div className="px-6 py-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Breach Sources:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {breach.sources.map((source, srcIndex) => (
                  <div
                    key={srcIndex}
                    className="bg-red-100 border border-red-300 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <div className="font-semibold text-red-900">{source.name}</div>
                    <div className="text-xs text-red-700">{formatDate(source.date)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compromised Data Fields */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Compromised Data:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dynamically render all fields */}
                {Object.entries(breach)
                  .filter(([key]) => {
                    // Exclude metadata fields
                    const excludedFields = ['sources', 'fields', 'source', 'hash']
                    return !excludedFields.includes(key) && breach[key]
                  })
                  .map(([key, value]) => {
                    const fieldKey = `${index}-${key}`
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')

                    // Special handling for password field
                    if (key === 'password') {
                      return (
                        <div key={key} className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600 uppercase">Password</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => togglePasswordReveal(index)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title={revealedPasswords.has(index) ? 'Hide password' : 'Reveal password'}
                              >
                                {revealedPasswords.has(index) ? (
                                  <EyeOff className="h-3 w-3 text-gray-600" />
                                ) : (
                                  <Eye className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(String(value), fieldKey)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copy password"
                              >
                                {copiedFields.has(fieldKey) ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="font-mono text-sm text-gray-900 break-all">
                            {revealedPasswords.has(index) ? String(value) : '••••••••••••'}
                          </div>
                          {breach.hash && (
                            <div className="text-xs text-gray-500 mt-1">Hash Type: {breach.hash}</div>
                          )}
                        </div>
                      )
                    }

                    // Regular field
                    return (
                      <DataField
                        key={key}
                        label={label}
                        value={String(value)}
                        onCopy={() => copyToClipboard(String(value), fieldKey)}
                        copied={copiedFields.has(fieldKey)}
                      />
                    )
                  })}
              </div>

              {/* Fields Found */}
              {breach.fields && Array.isArray(breach.fields) && breach.fields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                    All Fields Found:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {breach.fields.map((field, fieldIndex) => (
                      <span
                        key={fieldIndex}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Recommendations */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">🔐 Security Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>
              <strong>Change all passwords</strong> associated with the compromised accounts immediately.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>
              <strong>Enable two-factor authentication (2FA)</strong> on all accounts that support it.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>
              <strong>Use unique passwords</strong> for each account. Consider using a password manager.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>
              <strong>Monitor your accounts</strong> for suspicious activity and unauthorized access.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">5.</span>
            <span>
              <strong>Be cautious of phishing</strong> attempts that may target you using this leaked data.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

// Helper component for data fields
function DataField({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600 uppercase">{label}</span>
        <button
          onClick={onCopy}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={`Copy ${label.toLowerCase()}`}
        >
          {copied ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-gray-600" />
          )}
        </button>
      </div>
      <div className="font-mono text-sm text-gray-900 break-all">{value}</div>
    </div>
  )
}
