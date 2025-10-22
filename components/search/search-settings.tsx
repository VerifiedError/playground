'use client'

/**
 * Search Settings Panel
 *
 * Configurable settings for search playground behavior.
 * Settings persist to localStorage across sessions.
 */

import { useState, useEffect } from 'react'
import { X, Settings, Info } from 'lucide-react'

// Settings interface
export interface SearchSettings {
  // Search Behavior
  autoSearchOnTypeChange: boolean
  autoSearchOnFilterChange: boolean
  showFiltersByDefault: boolean
  showRecentSearches: boolean

  // Display
  defaultResultView: 'visual' | 'json' | 'split'
  resultsPerPage: number
  enableSyntaxHighlighting: boolean

  // Mobile Experience
  mobileTemplate: 'google' | 'ios' | 'app'

  // Desktop Experience
  desktopTemplate: 'google' | 'duckduckgo' | 'bing' | 'academic' | 'dashboard'

  // AI Analysis
  enableAutoAnalysis: boolean
  defaultAIModel: string
  analysisPromptTemplate: string
  showTokenCostInfo: boolean

  // AI Search (Ask AI button)
  aiSearchModel: string
  aiSearchMaxResults: number
  aiShowReasoning: boolean

  // Batch
  maxConcurrentRequests: number
  requestDelay: number
  autoExportResults: boolean
}

// Default settings
export const DEFAULT_SETTINGS: SearchSettings = {
  autoSearchOnTypeChange: false,
  autoSearchOnFilterChange: false,
  showFiltersByDefault: true,
  showRecentSearches: true,
  defaultResultView: 'visual',
  resultsPerPage: 10,
  enableSyntaxHighlighting: true,
  mobileTemplate: 'google',
  desktopTemplate: 'google',
  enableAutoAnalysis: false,
  defaultAIModel: 'groq/compound',
  analysisPromptTemplate: 'Summarize these search results and extract key insights.',
  showTokenCostInfo: true,
  aiSearchModel: 'groq/compound',
  aiSearchMaxResults: 10,
  aiShowReasoning: false,
  maxConcurrentRequests: 3,
  requestDelay: 1,
  autoExportResults: false,
}

const STORAGE_KEY = 'search-playground-settings'

interface SearchSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: SearchSettings
  onSettingsChange: (settings: SearchSettings) => void
}

export function SearchSettings({ isOpen, onClose, settings, onSettingsChange }: SearchSettingsProps) {
  const [localSettings, setLocalSettings] = useState<SearchSettings>(settings)

  // Update local settings when prop changes
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  function handleChange(key: keyof SearchSettings, value: any) {
    const newSettings = {
      ...localSettings,
      [key]: value,
    }
    setLocalSettings(newSettings)
  }

  function handleSave() {
    onSettingsChange(localSettings)
    onClose()
  }

  function handleReset() {
    setLocalSettings(DEFAULT_SETTINGS)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white border-l-2 border-black z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-gray-900" />
            <h2 className="text-xl font-bold text-gray-900">Search Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-6 w-6 text-gray-900" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Search Behavior Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Search Behavior</h3>
            <div className="space-y-4">
              {/* Auto-search on type change */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-900">
                      Auto-search on type change
                    </label>
                    <div className="group relative">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                        Automatically execute search when switching between Web, Images, Videos, etc.
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Execute search when changing search type
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSearchOnTypeChange}
                    onChange={(e) => handleChange('autoSearchOnTypeChange', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Auto-search on filter change */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-900">
                      Auto-search on filter change
                    </label>
                    <div className="group relative">
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                        Automatically execute search when changing country, language, or other filters
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Execute search when changing filters
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSearchOnFilterChange}
                    onChange={(e) => handleChange('autoSearchOnFilterChange', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Show filters by default */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">
                    Show filters by default
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Display filter options on page load
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showFiltersByDefault}
                    onChange={(e) => handleChange('showFiltersByDefault', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Display Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Display</h3>
            <div className="space-y-4">
              {/* Default result view */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Default result view
                </label>
                <select
                  value={localSettings.defaultResultView}
                  onChange={(e) => handleChange('defaultResultView', e.target.value as 'visual' | 'json' | 'split')}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontSize: '16px' }}
                >
                  <option value="visual">Visual (formatted results)</option>
                  <option value="json">JSON (raw response)</option>
                  <option value="split">Split (visual + JSON)</option>
                </select>
              </div>

              {/* Results per page */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Results per page: {localSettings.resultsPerPage}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={localSettings.resultsPerPage}
                  onChange={(e) => handleChange('resultsPerPage', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              {/* Syntax highlighting */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">
                    Enable syntax highlighting
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Colorize JSON output for better readability
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableSyntaxHighlighting}
                    onChange={(e) => handleChange('enableSyntaxHighlighting', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </section>

          {/* AI Analysis Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">AI Analysis</h3>
            <div className="space-y-4">
              {/* Enable auto-analysis */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">
                    Enable auto-analysis
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically analyze results with AI after search
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableAutoAnalysis}
                    onChange={(e) => handleChange('enableAutoAnalysis', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Default AI model */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Default AI model
                </label>
                <select
                  value={localSettings.defaultAIModel}
                  onChange={(e) => handleChange('defaultAIModel', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontSize: '16px' }}
                >
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant ($0.05/$0.08 per 1M tokens)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile ($0.59/$0.79 per 1M tokens)</option>
                </select>
              </div>

              {/* Analysis prompt template */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Analysis prompt template
                </label>
                <textarea
                  value={localSettings.analysisPromptTemplate}
                  onChange={(e) => handleChange('analysisPromptTemplate', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter default analysis prompt..."
                />
              </div>

              {/* Show token/cost info */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">
                    Show token/cost info
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Display token usage and cost for AI analysis
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showTokenCostInfo}
                    onChange={(e) => handleChange('showTokenCostInfo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </section>

          {/* AI Search Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">AI Search</h3>
            <div className="space-y-4">
              {/* AI Search Model */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  AI Search Model
                </label>
                <select
                  value={localSettings.aiSearchModel}
                  onChange={(e) => handleChange('aiSearchModel', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontSize: '16px' }}
                >
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant ($0.05/$0.08 per 1M tokens)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile ($0.59/$0.79 per 1M tokens)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Model used for "Ask AI" button to analyze queries and search intelligently
                </p>
              </div>

              {/* Max Results */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max results: {localSettings.aiSearchMaxResults}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={localSettings.aiSearchMaxResults}
                  onChange={(e) => handleChange('aiSearchMaxResults', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 results</span>
                  <span>20 results</span>
                </div>
              </div>

              {/* Show Reasoning */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">
                    Show AI reasoning
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Display AI's thought process when choosing search type
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.aiShowReasoning}
                    onChange={(e) => handleChange('aiShowReasoning', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance</h3>
            <div className="space-y-4">
              {/* Mobile Template */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mobile Template
                </label>
                <select
                  value={localSettings.mobileTemplate}
                  onChange={(e) => handleChange('mobileTemplate', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontSize: '16px' }}
                >
                  <option value="command-center">Command Center</option>
                  <option value="card-swipe">Card Swipe</option>
                  <option value="infinite-feed">Infinite Feed</option>
                  <option value="split-view">Split View</option>
                  <option value="compact-grid">Compact Grid</option>
                </select>
              </div>

              {/* Desktop Template */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Desktop Template
                </label>
                <select
                  value={localSettings.desktopTemplate}
                  onChange={(e) => handleChange('desktopTemplate', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  style={{ fontSize: '16px' }}
                >
                  <option value="research-hub">Research Hub</option>
                  <option value="dashboard-view">Dashboard View</option>
                  <option value="split-screen">Split Screen</option>
                  <option value="floating-panels">Floating Panels</option>
                  <option value="minimal-focus">Minimal Focus</option>
                </select>
              </div>
            </div>
          </section>

          {/* Batch Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Processing</h3>
            <div className="space-y-4">
              {/* Max concurrent requests */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Max concurrent requests: {localSettings.maxConcurrentRequests}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={localSettings.maxConcurrentRequests}
                  onChange={(e) => handleChange('maxConcurrentRequests', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 (sequential)</span>
                  <span>5 (parallel)</span>
                </div>
              </div>

              {/* Request delay */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Request delay: {localSettings.requestDelay}s
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={localSettings.requestDelay}
                  onChange={(e) => handleChange('requestDelay', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0s (no delay)</span>
                  <span>10s</span>
                </div>
              </div>

              {/* Auto-export results */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">
                    Auto-export results
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically download batch results as JSON
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoExportResults}
                    onChange={(e) => handleChange('autoExportResults', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t-2 border-black px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors font-medium"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Hook to manage search settings with localStorage persistence
 */
export function useSearchSettings() {
  const [settings, setSettings] = useState<SearchSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Failed to parse stored settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  function updateSettings(newSettings: SearchSettings) {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  }

  return {
    settings,
    updateSettings,
  }
}
