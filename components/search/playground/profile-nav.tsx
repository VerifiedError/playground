'use client'

import { useSession, signOut } from 'next-auth/react'
import { User, Settings, LogOut, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { isAdmin as checkIsAdmin } from '@/lib/admin-utils'

export function ProfileNav() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session?.user) {
    return null
  }

  const user = session.user
  const isAdmin = checkIsAdmin(session)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const handleSettings = () => {
    // Navigate to settings page (to be implemented)
    router.push('/settings')
  }

  const handleAdminDashboard = () => {
    router.push('/admin')
  }

  return (
    <div className="pt-4 border-t border-slate-700">
      <div className="space-y-2">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg border-2 border-slate-700">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {user.name || user.email}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {user.email}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1">
          {/* Admin Dashboard (only for admins) */}
          {isAdmin && (
            <button
              onClick={handleAdminDashboard}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4 text-purple-400" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
