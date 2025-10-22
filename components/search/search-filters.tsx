'use client'

/**
 * Search Filters Component
 *
 * Country, language, time, and result count filters.
 */

import { COUNTRY_CODES, LANGUAGE_CODES, TIME_FILTERS } from '@/lib/serper-client'

interface SearchFiltersProps {
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
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  function handleChange(key: string, value: any) {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="space-y-6">
      {/* Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
        <select
          value={filters.gl}
          onChange={(e) => handleChange('gl', e.target.value)}
          className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
        <select
          value={filters.hl}
          onChange={(e) => handleChange('hl', e.target.value)}
          className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
        >
          {LANGUAGE_CODES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Time Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Time</label>
        <select
          value={filters.tbs}
          onChange={(e) => handleChange('tbs', e.target.value)}
          className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
        >
          {TIME_FILTERS.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
        </select>
      </div>

      {/* Number of Results */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Results: {filters.num}
        </label>
        <input
          type="range"
          min="10"
          max="100"
          step="10"
          value={filters.num}
          onChange={(e) => handleChange('num', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10</span>
          <span>100</span>
        </div>
      </div>
      </div>

      {/* Advanced Parameters */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Advanced Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Autocorrect */}
          <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg bg-white">
            <div>
              <label className="text-sm font-medium text-gray-900">Autocorrect</label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically fix spelling errors in query
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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. New York, NY"
              className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
              style={{ fontSize: '16px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              For places/maps searches
            </p>
          </div>

          {/* Page Number */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Page Number
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
            <p className="text-xs text-gray-500 mt-1">
              Pagination (1-10)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
