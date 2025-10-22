'use client'

import React, { useEffect, useState } from 'react'
import {
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X as XIcon,
  ChevronDown,
  ChevronRight,
  Wrench,
  Globe,
  Code,
  Chrome,
  Link,
  Calculator,
  Image,
  Brain,
  Mic,
  Zap,
  FileJson,
  Database,
} from 'lucide-react'
import { toast } from 'sonner'

interface GroqModel {
  id: string
  displayName: string
  owner: string | null
  modelType: string | null
  contextWindow: number
  maxInputTokens: number | null
  maxOutputTokens: number | null
  maxImageSize: number | null
  maxImageCount: number | null
  maxAudioDuration: number | null
  inputPricing: number
  outputPricing: number
  supportsTools: boolean
  supportsWebSearch: boolean
  supportsCodeExecution: boolean
  supportsBrowserAutomation: boolean
  supportsVisitWebsite: boolean
  supportsWolframAlpha: boolean
  supportsVision: boolean
  supportsReasoning: boolean
  supportsAudio: boolean
  supportsStreaming: boolean
  supportsJsonMode: boolean
  supportsPromptCaching: boolean
  isActive: boolean
  releaseDate: string | null
  createdAt: string
  updatedAt: string
}

export function ModelManagementTab() {
  const [models, setModels] = useState<GroqModel[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null)

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/models')

      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }

      const data = await response.json()
      setModels(data.models)
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error('Failed to load models')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleToggleActive = async (modelId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update model')
      }

      toast.success(`Model ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchModels()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleRefreshFromGroq = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/models/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh models from Groq')
      }

      const data = await response.json()
      toast.success(`Refreshed ${data.count} models from Groq API`)
      fetchModels()
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh models')
    }
  }

  const renderCapabilityBadges = (model: GroqModel) => {
    const capabilities = [
      { key: 'supportsTools', icon: Wrench, label: 'Tools', color: 'bg-blue-50 text-blue-700 border-blue-500' },
      { key: 'supportsWebSearch', icon: Globe, label: 'Web Search', color: 'bg-green-50 text-green-700 border-green-500' },
      { key: 'supportsCodeExecution', icon: Code, label: 'Code Exec', color: 'bg-purple-50 text-purple-700 border-purple-500' },
      { key: 'supportsBrowserAutomation', icon: Chrome, label: 'Browser', color: 'bg-yellow-50 text-yellow-700 border-yellow-500' },
      { key: 'supportsVisitWebsite', icon: Link, label: 'Visit Site', color: 'bg-cyan-50 text-cyan-700 border-cyan-500' },
      { key: 'supportsWolframAlpha', icon: Calculator, label: 'Wolfram', color: 'bg-orange-50 text-orange-700 border-orange-500' },
      { key: 'supportsVision', icon: Image, label: 'Vision', color: 'bg-pink-50 text-pink-700 border-pink-500' },
      { key: 'supportsReasoning', icon: Brain, label: 'Reasoning', color: 'bg-indigo-50 text-indigo-700 border-indigo-500' },
      { key: 'supportsAudio', icon: Mic, label: 'Audio', color: 'bg-red-50 text-red-700 border-red-500' },
      { key: 'supportsStreaming', icon: Zap, label: 'Streaming', color: 'bg-teal-50 text-teal-700 border-teal-500' },
      { key: 'supportsJsonMode', icon: FileJson, label: 'JSON Mode', color: 'bg-emerald-50 text-emerald-700 border-emerald-500' },
      { key: 'supportsPromptCaching', icon: Database, label: 'Caching', color: 'bg-gray-50 text-gray-700 border-gray-500' },
    ]

    return capabilities
      .filter((cap) => model[cap.key as keyof GroqModel])
      .map((cap) => (
        <span
          key={cap.key}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 ${cap.color}`}
        >
          <cap.icon className="w-3 h-3" />
          {cap.label}
        </span>
      ))
  }

  if (loading && models.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Model Management
        </h3>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={handleRefreshFromGroq}
            className="flex items-center justify-center gap-2 px-4 py-3 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 border-2 border-green-700 transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Sync from Groq API
          </button>
          <button
            onClick={fetchModels}
            className="flex items-center justify-center gap-2 px-4 py-3 text-base bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Desktop Table (≥ md) */}
      <div className="hidden md:block bg-white rounded-lg border-2 border-black overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Context
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Functions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {models.map((model) => {
              const capabilities = renderCapabilityBadges(model)
              const isExpanded = expandedModelId === model.id

              return (
                <React.Fragment key={model.id}>
                  <tr
                    className={`hover:bg-gray-50 ${
                      !model.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedModelId(isExpanded ? null : model.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {model.displayName}
                          </p>
                          <p className="text-xs text-gray-600 font-mono">
                            {model.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {model.contextWindow.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        <p className="text-xs">In: ${model.inputPricing.toFixed(2)}/1M</p>
                        <p className="text-xs">Out: ${model.outputPricing.toFixed(2)}/1M</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {capabilities.length}
                        </span>
                        <span className="text-xs text-gray-600">
                          {capabilities.length === 1 ? 'function' : 'functions'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(model.id, model.isActive)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 ${
                          model.isActive
                        ? 'bg-green-50 text-green-700 border-green-500'
                        : 'bg-red-50 text-red-700 border-red-500'
                    }`}
                  >
                    {model.isActive ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <XIcon className="w-3 h-3" />
                    )}
                    {model.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleToggleActive(model.id, model.isActive)}
                    className="text-gray-900 hover:text-black"
                  >
                    {model.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>

              {/* Expandable Functions Row */}
              {isExpanded && (
                <tr className="bg-gray-50">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">AI Functions & Capabilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {capabilities.length > 0 ? (
                            capabilities
                          ) : (
                            <p className="text-sm text-gray-600">No special functions available</p>
                          )}
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-3 border-t-2 border-black">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Owner</p>
                          <p className="font-medium text-gray-900">{model.owner || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Model Type</p>
                          <p className="font-medium text-gray-900">{model.modelType || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Max Input Tokens</p>
                          <p className="font-medium text-gray-900">{model.maxInputTokens?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Max Output Tokens</p>
                          <p className="font-medium text-gray-900">{model.maxOutputTokens?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
              )
            })}
          </tbody>
        </table>

        {models.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No models found. Click "Sync from Groq API" to load models.
          </div>
        )}
      </div>

      {/* Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {models.map((model) => (
          <div
            key={model.id}
            className={`bg-white border-2 border-black rounded-lg p-4 ${
              !model.isActive ? 'opacity-50' : ''
            }`}
          >
            {/* Model Name & ID */}
            <div className="mb-3">
              <p className="font-semibold text-base text-gray-900 mb-1">
                {model.displayName}
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">
                {model.id}
              </p>
            </div>

            {/* AI Functions */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">AI Functions ({renderCapabilityBadges(model).length})</p>
              <div className="flex flex-wrap gap-2">
                {renderCapabilityBadges(model)}
                {renderCapabilityBadges(model).length === 0 && (
                  <p className="text-xs text-gray-600">No special functions</p>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <button
              onClick={() => handleToggleActive(model.id, model.isActive)}
              className={`w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border-2 min-h-[44px] mb-3 ${
                model.isActive
                  ? 'bg-green-50 text-green-700 border-green-500'
                  : 'bg-red-50 text-red-700 border-red-500'
              }`}
            >
              {model.isActive ? (
                <Check className="w-4 h-4" />
              ) : (
                <XIcon className="w-4 h-4" />
              )}
              {model.isActive ? 'Active' : 'Inactive'}
            </button>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-0.5">Context Window</p>
                <p className="font-medium text-gray-900">
                  {model.contextWindow.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-0.5">Input Pricing</p>
                <p className="font-medium text-gray-900">
                  ${model.inputPricing.toFixed(2)}/1M
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-xs mb-0.5">Output Pricing</p>
                <p className="font-medium text-gray-900">
                  ${model.outputPricing.toFixed(2)}/1M
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleToggleActive(model.id, model.isActive)}
              className="w-full mt-4 px-4 py-3 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] text-base font-medium"
            >
              {model.isActive ? 'Deactivate Model' : 'Activate Model'}
            </button>
          </div>
        ))}

        {models.length === 0 && (
          <div className="text-center py-12 px-4 bg-white border-2 border-black rounded-lg">
            <p className="text-base text-gray-600 mb-2">
              No models found
            </p>
            <p className="text-sm text-gray-500">
              Click "Sync from Groq API" to load models
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-500 text-center">
        Showing {models.length} model{models.length !== 1 ? 's' : ''} •{' '}
        {models.filter((m) => m.isActive).length} active •{' '}
        {models.filter((m) => !m.isActive).length} inactive
      </p>
    </div>
  )
}
