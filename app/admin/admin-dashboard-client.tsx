'use client'

import { useState } from 'react'
import {
  Users,
  BarChart3,
  Boxes,
  Settings,
  MessageSquare,
  TrendingUp,
  Shield,
  FileText,
  Key,
  Home,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { SystemStatsTab } from '@/components/admin/system-stats-tab'
import { SessionManagementTab } from '@/components/admin/session-management-tab'
import { UserManagementTab } from '@/components/admin/user-management-tab'
import { ModelManagementTab } from '@/components/admin/model-management-tab'
import { ApiKeysTab } from '@/components/admin/api-keys-tab'
import { ConfigurationTab } from '@/components/admin/configuration-tab'
import { AnalyticsTab } from '@/components/admin/analytics-tab'
import { SecurityAuditTab } from '@/components/admin/security-audit-tab'
import { LogsViewerTab } from '@/components/admin/logs-viewer-tab'

type Tab =
  | 'stats'
  | 'sessions'
  | 'users'
  | 'models'
  | 'api-keys'
  | 'config'
  | 'analytics'
  | 'security'
  | 'logs'

interface AdminDashboardClientProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

interface TabConfig {
  id: Tab
  label: string
  icon: React.ElementType
  description: string
}

export function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const router = useRouter()

  const tabs: TabConfig[] = [
    {
      id: 'stats',
      label: 'System Stats',
      icon: BarChart3,
      description: 'Real-time system metrics and health',
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: MessageSquare,
      description: 'Chat session monitoring and analytics',
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User management and access control',
    },
    {
      id: 'models',
      label: 'Models',
      icon: Boxes,
      description: 'AI model configuration and usage',
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: Key,
      description: 'External API access management',
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: Settings,
      description: 'Application settings and features',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Usage patterns and insights',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Security audit and threat monitoring',
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: FileText,
      description: 'System logs and activity tracking',
    },
  ]

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white border-r-2 border-black">
        {/* Header */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">CIA-Level Monitoring</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user.name || user.email}
              </div>
              <div className="text-xs text-gray-600">Administrator</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{tab.label}</div>
                <div
                  className={`text-xs truncate ${
                    activeTab === tab.id ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-black space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Back to App</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b-2 border-black p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-600">{tabs.find((t) => t.id === activeTab)?.label}</p>
              </div>
            </div>
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-8 max-w-[1920px] mx-auto">
          {/* Tab Header - Desktop */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600">
                  {tabs.find((t) => t.id === activeTab)?.description}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
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

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t-2 border-black safe-bottom">
          <div className="flex overflow-x-auto px-2 py-2 gap-2">
            {tabs.slice(0, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
