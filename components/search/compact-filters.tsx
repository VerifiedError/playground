'use client'

/**
 * Compact Filters Modal (Google-style "Tools")
 *
 * Slide-up modal on mobile, dropdown on desktop.
 * Groups filters intelligently with smart defaults.
 */

import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { COUNTRY_CODES, LANGUAGE_CODES, TIME_FILTERS } from '@/lib/serper-client'
import { MOBILE_SEARCH_TEMPLATES, type MobileSearchTemplate } from '@/lib/search-template-settings'

interface CompactFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    num: number
    gl: string
    hl: string
    tbs: string
    autocorrect: boolean
    location: string
    page: number
  }
  onFilterChange: (filters: any) => void
  currentTemplate?: MobileSearchTemplate
  onTemplateChange?: (template: MobileSearchTemplate) => void
  isMobile?: boolean
}

// Popular countries (shown by default)
const POPULAR_COUNTRIES = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
]

// More countries (expandable)
const MORE_COUNTRIES = COUNTRY_CODES.filter(
  (country) => !POPULAR_COUNTRIES.find((pop) => pop.code === country.code)
)

export function CompactFilters({ isOpen, onClose, filters, onFilterChange, currentTemplate = 'command-center', onTemplateChange, isMobile = false }: CompactFiltersProps) {
  const [showMoreCountries, setShowMoreCountries] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!isOpen) return null

  function handleChange(key: string, value: any) {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 md:top-auto md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:top-20 bg-white border-2 border-black z-50 rounded-t-2xl md:rounded-2xl max-h-[60vh] md:max-h-[80vh] overflow-y-auto md:max-w-2xl md:w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Tools</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Filters */}
          <div className="space-y-3">
            {/* Time Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Time</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_FILTERS.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handleChange('tbs', time.value)}
                    className={`px-2 py-1.5 text-xs font-medium rounded border-2 transition-colors ${
                      filters.tbs === time.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count Slider */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Results: <span className="font-bold">{filters.num}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={filters.num}
                onChange={(e) => handleChange('num', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>10</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          <div className="border-t border-gray-200 pt-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>Advanced</span>
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                  <select
                    value={filters.gl}
                    onChange={(e) => handleChange('gl', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
                    style={{ fontSize: '16px' }}
                  >
                    <optgroup label="Popular">
                      {POPULAR_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </optgroup>
                    {showMoreCountries && (
                      <optgroup label="More Countries">
                        {MORE_COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {!showMoreCountries && (
                    <button
                      onClick={() => setShowMoreCountries(true)}
                      className="mt-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Show more countries...
                    </button>
                  )}
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
                  <select
                    value={filters.hl}
                    onChange={(e) => handleChange('hl', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
                    style={{ fontSize: '16px' }}
                  >
                    {LANGUAGE_CODES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location (for places/maps) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Location <span className="text-gray-500 text-xs">(for places/maps)</span>
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Autocorrect Toggle */}
                <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg bg-white">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Autocorrect</label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically fix spelling errors
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.autocorrect}
                      onChange={(e) => handleChange('autocorrect', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Page Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Page Number <span className="text-gray-500 text-xs">(1-10)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.page}
                    onChange={(e) => handleChange('page', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Template Selection (only on mobile) */}
          {isMobile && onTemplateChange && (
            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mobile Template (15 options)</h3>
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                {Object.entries(MOBILE_SEARCH_TEMPLATES).map(([id, template]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onTemplateChange(id as MobileSearchTemplate)}
                    className={`p-2 border-2 rounded-lg transition-colors ${
                      currentTemplate === id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    title={template.description}
                  >
                    <div className="text-xl mb-1">{template.icon}</div>
                    <div className="text-[10px] font-medium text-gray-900 leading-tight line-clamp-2">
                      {template.name}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tap any template to preview. Best for: {MOBILE_SEARCH_TEMPLATES[currentTemplate].bestFor}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-black px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => {
              // Reset to defaults
              handleChange('num', 10)
              handleChange('gl', 'us')
              handleChange('hl', 'en')
              handleChange('tbs', '')
              handleChange('autocorrect', true)
              handleChange('location', '')
              handleChange('page', 1)
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
