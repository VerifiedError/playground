'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Save, Settings, ToggleLeft, ToggleRight, Globe, Shield, Upload, Share, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AdminConfig {
  id: string
  siteName: string
  siteDescription?: string | null
  logoUrl?: string | null
  supportEmail?: string | null
  enableRegistration: boolean
  enableVisionModels: boolean
  enableFileUploads: boolean
  enableSessionSharing: boolean
  maxUploadSizeMB: number
  maxImagesPerMsg: number
  globalRateLimit: number
  sessionTimeoutMin: number
  maxTokensPerRequest: number
  defaultModel?: string | null
  createdAt: string
  updatedAt: string
}

export function ConfigurationTab() {
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [lastCacheCleared, setLastCacheCleared] = useState<string | null>(null)

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/config')

      if (!response.ok) {
        throw new Error('Failed to fetch configuration')
      }

      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Error fetching configuration:', error)
      toast.error('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async () => {
    if (!config) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error('Failed to update configuration')
      }

      const data = await response.json()
      setConfig(data.settings)
      toast.success('Configuration saved successfully')
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof AdminConfig) => {
    if (!config) return
    setConfig({
      ...config,
      [field]: !config[field],
    })
  }

  const handleChange = (field: keyof AdminConfig, value: any) => {
    if (!config) return
    setConfig({
      ...config,
      [field]: value,
    })
  }

  const handleClearCache = async () => {
    try {
      setClearingCache(true)
      setShowConfirmDialog(false)

      const response = await fetch('/api/admin/vercel/cache', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to clear cache')
      }

      const data = await response.json()
      setLastCacheCleared(data.clearedAt)
      toast.success('Vercel cache cleared successfully!')
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to clear cache')
    } finally {
      setClearingCache(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        Failed to load configuration
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold text-gray-900">
          Application Configuration
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Application Settings */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Application Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={config.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={config.supportEmail || ''}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              placeholder="support@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Site Description
            </label>
            <textarea
              value={config.siteDescription || ''}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              placeholder="Enter site description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={config.logoUrl || ''}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Model
            </label>
            <input
              type="text"
              value={config.defaultModel || ''}
              onChange={(e) => handleChange('defaultModel', e.target.value)}
              placeholder="llama-3.3-70b-versatile"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-500" />
          Feature Flags
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleSwitch
            label="Enable User Registration"
            checked={config.enableRegistration}
            onChange={() => handleToggle('enableRegistration')}
            description="Allow new users to create accounts"
          />
          <ToggleSwitch
            label="Enable Vision Models"
            checked={config.enableVisionModels}
            onChange={() => handleToggle('enableVisionModels')}
            description="Allow image uploads and vision model usage"
          />
          <ToggleSwitch
            label="Enable File Uploads"
            checked={config.enableFileUploads}
            onChange={() => handleToggle('enableFileUploads')}
            description="Allow users to upload files/images"
          />
          <ToggleSwitch
            label="Enable Session Sharing"
            checked={config.enableSessionSharing}
            onChange={() => handleToggle('enableSessionSharing')}
            description="Allow users to share sessions publicly"
          />
        </div>
      </div>

      {/* API & Resource Settings */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" />
          API & Resource Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Upload Size (MB)
            </label>
            <input
              type="number"
              value={config.maxUploadSizeMB}
              onChange={(e) => handleChange('maxUploadSizeMB', parseInt(e.target.value) || 0)}
              min={1}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Images Per Message
            </label>
            <input
              type="number"
              value={config.maxImagesPerMsg}
              onChange={(e) => handleChange('maxImagesPerMsg', parseInt(e.target.value) || 0)}
              min={1}
              max={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Global Rate Limit (req/min)
            </label>
            <input
              type="number"
              value={config.globalRateLimit}
              onChange={(e) => handleChange('globalRateLimit', parseInt(e.target.value) || 0)}
              min={10}
              max={1000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={config.sessionTimeoutMin}
              onChange={(e) => handleChange('sessionTimeoutMin', parseInt(e.target.value) || 0)}
              min={60}
              max={43200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round(config.sessionTimeoutMin / 60)} hours ({Math.round(config.sessionTimeoutMin / 1440)} days)
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Tokens Per Request
            </label>
            <input
              type="number"
              value={config.maxTokensPerRequest}
              onChange={(e) => handleChange('maxTokensPerRequest', parseInt(e.target.value) || 0)}
              min={1000}
              max={128000}
              step={1000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Deployment Management */}
      <div className="bg-white rounded-lg border-2 border-black p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-orange-500" />
          Deployment Management
        </h4>
        <div className="space-y-4">
          {/* Warning message about VERCEL_TOKEN */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⚠️ Requires VERCEL_TOKEN
            </p>
            <p className="text-xs text-yellow-700">
              To use this feature, set <code className="px-1 py-0.5 bg-yellow-100 rounded">VERCEL_TOKEN</code> in your Vercel environment variables.
              <br />
              Get your token from: <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="underline font-medium">Vercel Dashboard → Settings → Tokens</a>
            </p>
          </div>

          <div className="flex items-start gap-4">
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={clearingCache}
              className="flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${clearingCache ? 'animate-spin' : ''}`} />
              {clearingCache ? 'Clearing Cache...' : 'Clear Vercel Cache'}
            </button>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Clear CDN cache and force fresh builds for all users
              </p>
              {lastCacheCleared && (
                <p className="text-xs text-gray-500 mt-1">
                  Last cleared: {new Date(lastCacheCleared).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg border-2 border-black shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Clear Vercel Cache?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will clear the CDN cache for all users and force fresh builds. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-2 border-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 text-sm bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-600 rounded-lg transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Last updated: {new Date(config.updatedAt).toLocaleString()}
      </p>
    </div>
  )
}

interface ToggleSwitchProps {
  label: string
  checked: boolean
  onChange: () => void
  description?: string
}

function ToggleSwitch({ label, checked, onChange, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={onChange}
        className={`flex items-center justify-center w-12 h-6 rounded-full transition-colors ${
          checked
            ? 'bg-black'
            : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-3' : '-translate-x-3'
          }`}
        />
      </button>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
