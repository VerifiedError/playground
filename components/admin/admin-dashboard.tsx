'use client'

import { useState } from 'react'
import {
  Users,
  BarChart3,
  Boxes,
  Settings as SettingsIcon,
  MessageSquare,
  Settings,
  TrendingUp,
  Shield,
  FileText,
  ChevronRight,
  Key,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { UserManagementTab } from './user-management-tab'
import { SystemStatsTab } from './system-stats-tab'
import { ModelManagementTab} from './model-management-tab'
import { SessionManagementTab } from './session-management-tab'
import { ConfigurationTab } from './configuration-tab'
import { AnalyticsTab } from './analytics-tab'
import { SecurityAuditTab } from './security-audit-tab'
import { LogsViewerTab } from './logs-viewer-tab'
import { ApiKeysTab } from './api-keys-tab'

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'users' | 'stats' | 'models' | 'sessions' | 'config' | 'analytics' | 'security' | 'logs' | 'api-keys'

interface TabConfig {
  id: Tab
  label: string
  icon: React.ElementType
  description: string
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [showTabContent, setShowTabContent] = useState(false)

  if (!isOpen) return null

  const tabs: TabConfig[] = [
    { id: 'stats', label: 'System Stats', icon: BarChart3, description: 'Users, sessions, and cost metrics' },
    { id: 'sessions', label: 'Sessions', icon: MessageSquare, description: 'Manage chat sessions' },
    { id: 'users', label: 'Users', icon: Users, description: 'User accounts and roles' },
    { id: 'models', label: 'Models', icon: Boxes, description: 'AI model management' },
    { id: 'api-keys', label: 'API Keys', icon: Key, description: 'External API access keys' },
    { id: 'config', label: 'Configuration', icon: Settings, description: 'Application settings' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Usage analytics and insights' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Security audit and logs' },
    { id: 'logs', label: 'Logs', icon: FileText, description: 'System and activity logs' },
  ]

  const tabLabels: Record<Tab, string> = {
    stats: 'System Stats',
    sessions: 'Sessions',
    users: 'Users',
    models: 'Models',
    'api-keys': 'API Keys',
    config: 'Configuration',
    analytics: 'Analytics',
    security: 'Security',
    logs: 'Logs',
  }

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId)
    setShowTabContent(true)
  }

  const handleClose = () => {
    // On mobile with tab content showing, go back to tab list
    if (showTabContent && window.innerWidth < 768) {
      setShowTabContent(false)
    } else {
      // Otherwise close the modal
      onClose()
    }
  }

  return (
    <ResponsiveModal
      title="Admin Dashboard"
      subtitle={showTabContent ? tabLabels[activeTab] : ''}
      onClose={handleClose}
      useBackButton={showTabContent}
      maxWidth="max-w-6xl"
      height="h-[90vh]"
    >
      {/* Mobile Tab List (< md breakpoint) */}
      <div className="md:hidden">
        {!showTabContent ? (
          <div className="p-4 space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="w-full flex items-center gap-4 p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors min-h-[68px] text-left"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                  <tab.icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-gray-900">{tab.label}</p>
                  <p className="text-sm text-gray-600 truncate">{tab.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {activeTab === 'stats' && <SystemStatsTab />}
            {activeTab === 'sessions' && <SessionManagementTab />}
            {activeTab === 'users' && <UserManagementTab />}
            {activeTab === 'models' && <ModelManagementTab />}
            {activeTab === 'api-keys' && <ApiKeysTab />}
            {activeTab === 'config' && <ConfigurationTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'security' && <SecurityAuditTab />}
            {activeTab === 'logs' && <LogsViewerTab />}
          </div>
        )}
      </div>

      {/* Desktop Tabs (≥ md breakpoint) */}
      <div className="hidden md:block">
        {/* Tabs - Horizontal scrollable on mobile, full on desktop */}
        <div className="flex border-b-2 border-black px-2 md:px-6 overflow-x-auto -mt-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'stats'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            System Stats
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'sessions'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'users'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'models'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Boxes className="w-5 h-5" />
            Models
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'api-keys'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-5 h-5" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'config'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'analytics'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'security'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-5 h-5" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 flex items-center gap-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'logs'
                ? 'border-black text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Logs
          </button>
        </div>

        {/* Desktop Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'stats' && <SystemStatsTab />}
          {activeTab === 'sessions' && <SessionManagementTab />}
          {activeTab === 'users' && <UserManagementTab />}
          {activeTab === 'models' && <ModelManagementTab />}
          {activeTab === 'api-keys' && <ApiKeysTab />}
          {activeTab === 'config' && <ConfigurationTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'security' && <SecurityAuditTab />}
          {activeTab === 'logs' && <LogsViewerTab />}
        </div>
      </div>
    </ResponsiveModal>
  )
}
