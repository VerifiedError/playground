'use client'

/**
 * API Keys Management Tab
 *
 * Allows users to create, view, and manage API keys for external API access.
 */

import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Check, Key, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  rateLimit: number
  totalRequests: number
  lastUsedAt: string | null
  lastUsedIp: string | null
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export function ApiKeysTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ key: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['chat'] as string[],
    rateLimit: 60,
  })

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys()
  }, [])

  async function loadApiKeys() {
    try {
      setLoading(true)
      const response = await fetch('/api/keys')

      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }

      const data = await response.json()
      setApiKeys(data.keys || [])
    } catch (error: any) {
      console.error('Error loading API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateKey() {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create API key')
      }

      const data = await response.json()

      // Show the new key (only shown once!)
      setNewKey({
        key: data.key,
        name: data.name,
      })

      // Reset form
      setFormData({
        name: '',
        permissions: ['chat'],
        rateLimit: 60,
      })
      setShowCreateForm(false)

      // Reload keys
      loadApiKeys()

      toast.success('API key created successfully')
    } catch (error: any) {
      console.error('Error creating API key:', error)
      toast.error(error.message || 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleActive(keyId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update API key')
      }

      toast.success(`API key ${!currentStatus ? 'enabled' : 'disabled'}`)
      loadApiKeys()
    } catch (error: any) {
      console.error('Error toggling API key:', error)
      toast.error('Failed to update API key')
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }

      toast.success('API key deleted')
      loadApiKeys()
    } catch (error: any) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600 mt-1">Manage API keys for external applications</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {/* New Key Display (only shown once after creation) */}
      {newKey && (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Save your API key</h3>
              <p className="text-sm text-gray-600 mt-1">
                This is the only time you'll see this key. Store it securely - it cannot be retrieved later.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border-2 border-black rounded-lg text-sm font-mono text-gray-900">
                  {newKey.key}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey.key)}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New API Key</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production API, Mobile App"
                className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Permissions</label>
              <div className="space-y-2">
                {['chat', 'sessions', 'models', 'files', '*'].map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...formData.permissions, perm] })
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter((p) => p !== perm),
                          })
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-900">
                      {perm === '*' ? 'All permissions' : perm}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rate Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={handleCreateKey}
              disabled={creating}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Key'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 border-2 border-black rounded-lg transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading API keys...</div>
      ) : apiKeys.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-lg p-8 text-center">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No API keys yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first API key to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white border-2 border-black rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{key.name}</h3>
                    {key.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                        {key.keyPrefix}...
                      </code>
                    </div>
                    <div>
                      <strong>Permissions:</strong> {key.permissions.join(', ')}
                    </div>
                    <div>
                      <strong>Rate Limit:</strong> {key.rateLimit} requests/minute
                    </div>
                    <div>
                      <strong>Total Requests:</strong> {key.totalRequests.toLocaleString()}
                    </div>
                    <div>
                      <strong>Last Used:</strong> {formatDate(key.lastUsedAt)}
                      {key.lastUsedIp && ` from ${key.lastUsedIp}`}
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(key.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(key.id, key.isActive)}
                    className={`px-3 py-2 border-2 border-black rounded-lg transition-colors min-h-[44px] ${
                      key.isActive
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                    title={key.isActive ? 'Disable' : 'Enable'}
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="px-3 py-2 bg-white text-red-600 hover:bg-red-50 border-2 border-black rounded-lg transition-colors min-h-[44px]"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documentation */}
      <div className="bg-gray-50 border-2 border-black rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">API Documentation</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <strong className="text-gray-900">Endpoint:</strong>{' '}
            <code className="px-2 py-1 bg-white border border-black rounded font-mono text-xs">
              POST /api/v1/chat/completions
            </code>
          </div>
          <div>
            <strong className="text-gray-900">Authentication:</strong>{' '}
            <code className="px-2 py-1 bg-white border border-black rounded font-mono text-xs">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <strong className="text-gray-900">Example Request:</strong>
            <pre className="mt-2 p-3 bg-white border-2 border-black rounded-lg overflow-x-auto text-xs font-mono">
{`curl https://your-domain.com/api/v1/chat/completions \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
