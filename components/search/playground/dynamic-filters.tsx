'use client'

import { useState, useEffect } from 'react'
import type { SerperSearchType } from '@/lib/serper-types'
import type { PlaygroundFilters } from '@/app/search/playground/page'

interface DynamicFiltersProps {
  searchType: SerperSearchType
  filters: PlaygroundFilters
  onFiltersChange: (filters: PlaygroundFilters) => void
  loading: boolean
}

interface GroqModel {
  id: string
  modelName: string
  displayName: string
  contextWindow: number
  inputCost: number
  outputCost: number
  isActive: boolean
  capabilities?: string[]
}

// Country options (top 20)
const COUNTRIES = [
  { value: 'us', label: 'United States (us)' },
  { value: 'uk', label: 'United Kingdom (uk)' },
  { value: 'ca', label: 'Canada (ca)' },
  { value: 'au', label: 'Australia (au)' },
  { value: 'de', label: 'Germany (de)' },
  { value: 'fr', label: 'France (fr)' },
  { value: 'es', label: 'Spain (es)' },
  { value: 'it', label: 'Italy (it)' },
  { value: 'nl', label: 'Netherlands (nl)' },
  { value: 'br', label: 'Brazil (br)' },
  { value: 'mx', label: 'Mexico (mx)' },
  { value: 'in', label: 'India (in)' },
  { value: 'jp', label: 'Japan (jp)' },
  { value: 'cn', label: 'China (cn)' },
  { value: 'kr', label: 'South Korea (kr)' },
  { value: 'ru', label: 'Russia (ru)' },
  { value: 'sg', label: 'Singapore (sg)' },
  { value: 'nz', label: 'New Zealand (nz)' },
  { value: 'za', label: 'South Africa (za)' },
  { value: 'ae', label: 'UAE (ae)' },
]

// Language options (top 18)
const LANGUAGES = [
  { value: 'en', label: 'English (en)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'de', label: 'German (de)' },
  { value: 'it', label: 'Italian (it)' },
  { value: 'pt', label: 'Portuguese (pt)' },
  { value: 'ru', label: 'Russian (ru)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'zh', label: 'Chinese (zh)' },
  { value: 'ar', label: 'Arabic (ar)' },
  { value: 'hi', label: 'Hindi (hi)' },
  { value: 'nl', label: 'Dutch (nl)' },
  { value: 'pl', label: 'Polish (pl)' },
  { value: 'tr', label: 'Turkish (tr)' },
  { value: 'sv', label: 'Swedish (sv)' },
  { value: 'no', label: 'Norwegian (no)' },
  { value: 'da', label: 'Danish (da)' },
]

// Date range options
const DATE_RANGES = [
  { value: '', label: 'Any time' },
  { value: 'qdr:h', label: 'Past hour' },
  { value: 'qdr:d', label: 'Past 24 hours' },
  { value: 'qdr:w', label: 'Past week' },
  { value: 'qdr:m', label: 'Past month' },
  { value: 'qdr:y', label: 'Past year' },
]

// Results count options
const RESULTS_COUNTS = [10, 20, 30, 40, 50, 100]

export function DynamicFilters({
  searchType,
  filters,
  onFiltersChange,
  loading,
}: DynamicFiltersProps) {
  const [models, setModels] = useState<GroqModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

  const updateFilter = <K extends keyof PlaygroundFilters>(key: K, value: PlaygroundFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  // Fetch Groq models when playground type is selected
  useEffect(() => {
    if (searchType === 'playground') {
      setLoadingModels(true)
      fetch('/api/models')
        .then((res) => res.json())
        .then((data) => {
          setModels(data.models || [])
          // Set default model if not already set
          if (!filters.selectedModel && data.models && data.models.length > 0) {
            updateFilter('selectedModel', data.models[0].modelName)
          }
        })
        .catch((err) => console.error('Error fetching models:', err))
        .finally(() => setLoadingModels(false))
    }
  }, [searchType])

  // LeakCheck-specific filters (Breach/Leak Checking)
  if (searchType === 'leakcheck') {
    return (
      <div className="space-y-4">
        {/* Query Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Query Type <span className="text-slate-500">type</span>
          </label>
          <select
            value={filters.queryType || 'auto'}
            onChange={(e) => updateFilter('queryType', e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="auto">Auto-detect</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
            <option value="domain">Domain</option>
            <option value="phone">Phone Number</option>
            <option value="hash">Password Hash</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            LeakCheck will automatically detect the query type if set to &quot;Auto-detect&quot;
          </p>
        </div>

        {/* Email Keyword Search */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.emailKeywordSearch === true}
              onChange={(e) => updateFilter('emailKeywordSearch', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
              disabled={loading}
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              Email Keyword Search
            </span>
          </label>
          <p className="text-xs text-slate-500 mt-1 ml-6">
            Automatically converts &quot;keyword&quot; → &quot;keyword@*.*&quot; for wildcard email searches
          </p>
          <div className="mt-2 ml-6 bg-slate-800/50 border border-slate-700 rounded-lg p-2">
            <p className="text-xs text-slate-400 mb-1">
              <span className="text-sky-400 font-medium">Example:</span>
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Input:</span>
                <code className="text-green-400 bg-slate-900 px-1.5 py-0.5 rounded">john</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Searches:</span>
                <code className="text-purple-400 bg-slate-900 px-1.5 py-0.5 rounded">john@*.*</code>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Results Count <span className="text-slate-500">num</span>
          </label>
          <select
            value={filters.num}
            onChange={(e) => updateFilter('num', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            {RESULTS_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count} results
              </option>
            ))}
          </select>
        </div>

        {/* Page Number */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Page <span className="text-slate-500">page</span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={filters.page || 1}
            onChange={(e) => updateFilter('page', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Security Notice */}
        <div className="bg-red-900/20 border-2 border-red-500/30 rounded-lg p-4">
          <p className="text-xs text-red-300 leading-relaxed">
            🔒 <strong>Privacy Notice:</strong> LeakCheck searches public breach databases. Your
            query may be logged. Only search for data you own or have permission to investigate.
          </p>
        </div>
      </div>
    )
  }

  // Playground-specific filters (AI chat with full model selection)
  if (searchType === 'playground') {
    return (
      <div className="space-y-4">
        {/* Model Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            AI Model <span className="text-sky-400">*</span>
          </label>
          {loadingModels ? (
            <div className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-400 text-sm">
              Loading models...
            </div>
          ) : (
            <select
              value={filters.selectedModel || ''}
              onChange={(e) => updateFilter('selectedModel', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              disabled={loading || loadingModels}
            >
              {models.length === 0 && (
                <option value="">No models available</option>
              )}
              {models.map((model) => (
                <option key={model.id} value={model.modelName}>
                  {model.displayName} ({model.contextWindow.toLocaleString()} ctx)
                </option>
              ))}
            </select>
          )}
          {filters.selectedModel && models.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {(() => {
                const selected = models.find((m) => m.modelName === filters.selectedModel)
                if (selected) {
                  return `$${selected.inputCost.toFixed(2)}/$${selected.outputCost.toFixed(2)} per 1M tokens`
                }
                return ''
              })()}
            </p>
          )}
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Temperature <span className="text-slate-400">({filters.temperature || 0.7})</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={filters.temperature || 0.7}
            onChange={(e) => updateFilter('temperature', parseFloat(e.target.value))}
            className="w-full accent-sky-500"
            disabled={loading}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Focused (0)</span>
            <span>Balanced (1)</span>
            <span>Creative (2)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Max Tokens <span className="text-slate-400">({filters.maxTokens || 2048})</span>
          </label>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={filters.maxTokens || 2048}
            onChange={(e) => updateFilter('maxTokens', parseInt(e.target.value))}
            className="w-full accent-sky-500"
            disabled={loading}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>256</span>
            <span>2048</span>
            <span>8192</span>
          </div>
        </div>

        {/* System Prompt (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            System Prompt <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={filters.systemPrompt || ''}
            onChange={(e) => updateFilter('systemPrompt', e.target.value)}
            placeholder="You are a helpful AI assistant..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm resize-none"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">
            Define the AI's behavior and personality
          </p>
        </div>

        {/* Enable Tools Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.enableTools !== false}
              onChange={(e) => updateFilter('enableTools', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
              disabled={loading}
            />
            <span className="text-sm text-slate-300">Enable Tools (Web Search, Code Exec, etc.)</span>
          </label>
        </div>
      </div>
    )
  }

  // Maps-specific filters
  if (searchType === 'maps') {
    return (
      <div className="space-y-4">
        {/* GPS Position */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            GPS position & zoom level <span className="text-slate-500">ll</span>
          </label>
          <input
            type="text"
            value={filters.gps || ''}
            onChange={(e) => updateFilter('gps', e.target.value)}
            placeholder="@latitude,longitude,zoom"
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">Optional</p>
        </div>

        {/* Place ID */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Place ID <span className="text-slate-500">placeid</span>
          </label>
          <input
            type="text"
            value={filters.placeId || ''}
            onChange={(e) => updateFilter('placeId', e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            disabled={loading}
          />
        </div>

        {/* CID */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            CID <span className="text-slate-500">cid</span>
          </label>
          <input
            type="text"
            value={filters.cid || ''}
            onChange={(e) => updateFilter('cid', e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            disabled={loading}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Language <span className="text-slate-500">hl</span>
          </label>
          <select
            value={filters.hl}
            onChange={(e) => updateFilter('hl', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Page */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Page
          </label>
          <input
            type="number"
            min="1"
            value={filters.page}
            onChange={(e) => updateFilter('page', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>
    )
  }

  // Places-specific filters
  if (searchType === 'places') {
    return (
      <div className="space-y-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Country <span className="text-slate-500">gl</span>
          </label>
          <select
            value={filters.gl}
            onChange={(e) => updateFilter('gl', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Location <span className="text-slate-500">location</span>
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            disabled={loading}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Language <span className="text-slate-500">hl</span>
          </label>
          <select
            value={filters.hl}
            onChange={(e) => updateFilter('hl', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Autocorrect */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.autocorrect !== false}
              onChange={(e) => updateFilter('autocorrect', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
              disabled={loading}
            />
            <span className="text-sm text-slate-300">Autocorrect</span>
          </label>
        </div>

        {/* Page */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Page
          </label>
          <input
            type="number"
            min="1"
            value={filters.page}
            onChange={(e) => updateFilter('page', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>
    )
  }

  // Search/News/Scholar/Shopping/Images/Videos - Common filters
  return (
    <div className="space-y-4">
      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Country <span className="text-slate-500">gl</span>
        </label>
        <select
          value={filters.gl}
          onChange={(e) => updateFilter('gl', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          disabled={loading}
        >
          {COUNTRIES.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Location <span className="text-slate-500">location</span>
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value)}
          placeholder="Optional"
          className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
          disabled={loading}
        />
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Language <span className="text-slate-500">hl</span>
        </label>
        <select
          value={filters.hl}
          onChange={(e) => updateFilter('hl', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          disabled={loading}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date range (Search, News only) */}
      {(searchType === 'search' || searchType === 'news') && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date range <span className="text-slate-500">tbs</span>
          </label>
          <select
            value={filters.tbs || ''}
            onChange={(e) => updateFilter('tbs', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            {DATE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Results count (not for images) */}
      {searchType !== 'images' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Results <span className="text-slate-500">num</span>
          </label>
          <select
            value={filters.num}
            onChange={(e) => updateFilter('num', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          >
            {RESULTS_COUNTS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Page
        </label>
        <input
          type="number"
          min="1"
          value={filters.page}
          onChange={(e) => updateFilter('page', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          disabled={loading}
        />
      </div>
    </div>
  )
}
