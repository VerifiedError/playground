'use client'

import { useState } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LeakCheckResults } from '@/components/search/leakcheck-results'
import type { LeakCheckSearchResponse } from '@/lib/serper-types'
import { mobileToast } from '@/lib/mobile-toast'

const QUERY_TYPES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'email', label: 'Email' },
  { value: 'username', label: 'Username' },
  { value: 'domain', label: 'Domain' },
  { value: 'phone', label: 'Phone' },
  { value: 'hash', label: 'Hash' },
]

export default function CheckLeaksPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [queryType, setQueryType] = useState('auto')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<LeakCheckSearchResponse | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) {
      mobileToast.warning('Please enter something to check')
      return
    }

    setIsSearching(true)
    setResults(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'leakcheck',
          q: query.trim(),
          queryType: queryType,
        }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data)

      if (data.found === 0) {
        mobileToast.success('No breaches found - you\'re safe!')
      } else {
        mobileToast.warning(`Found ${data.found} breach${data.found > 1 ? 'es' : ''}`)
      }
    } catch (error) {
      console.error('Search error:', error)
      mobileToast.error('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:hidden"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Check for Leaks
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 md:ml-0 ml-14">
            Search breach databases to see if your data has been compromised
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          {/* Query Type Selector */}
          <div className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex overflow-x-auto no-scrollbar">
              {QUERY_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setQueryType(type.value)}
                  className={`
                    flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${
                      queryType === type.value
                        ? 'border-red-600 text-red-600 dark:text-red-400'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter ${queryType === 'auto' ? 'email, username, etc.' : queryType}...`}
                className="
                  flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700
                  bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                  placeholder:text-slate-500 dark:placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  text-base
                "
                disabled={isSearching}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="
                  px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700
                  text-white rounded-lg font-medium transition-colors
                  flex items-center gap-2 min-w-[100px] justify-center
                "
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="hidden sm:inline">Checking...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span className="hidden sm:inline">Check</span>
                  </>
                )}
              </button>
            </div>

            {/* Helper Text */}
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
              <p>
                This search checks public breach databases. All searches are encrypted and not stored.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.found > 0 ? (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-200">
                    Found {results.found} breach{results.found > 1 ? 'es' : ''}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Your data has been compromised. Review the details below and take action immediately.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-200">
                    No breaches found
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your data was not found in known breach databases.
                  </p>
                </div>
              </div>
            )}

            <LeakCheckResults response={results} />
          </div>
        )}

        {/* Info Cards */}
        {!results && (
          <div className="space-y-4 mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-2">
              What can you check?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Email',
                  description: 'Check if your email has been in any data breaches',
                  icon: '📧',
                },
                {
                  title: 'Username',
                  description: 'Search for breached accounts by username',
                  icon: '👤',
                },
                {
                  title: 'Domain',
                  description: 'Check all breaches affecting a domain',
                  icon: '🌐',
                },
                {
                  title: 'Phone',
                  description: 'See if your phone number has been leaked',
                  icon: '📱',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
