import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminDashboardClient } from './admin-dashboard-client'

export const metadata = {
  title: 'Admin Dashboard | Playground',
  description: 'Comprehensive admin dashboard with system monitoring and analytics',
}

/**
 * Admin Dashboard Route
 *
 * CIA-Level Tracking & Monitoring:
 * - Real-time system metrics and health monitoring
 * - Comprehensive user activity tracking
 * - API usage analytics and rate limiting
 * - Security audit logs and threat detection
 * - Session management and cost analytics
 * - Search pattern analysis
 * - Full audit trail of all system operations
 *
 * Protected Route: Admin-only access
 */
export default async function AdminDashboardPage() {
  // Check authentication and admin role
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/admin')
  }

  // Check if user is admin
  const user = session.user as { role?: string }
  if (user.role !== 'admin') {
    redirect('/')
  }

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardClient user={session.user} />
    </Suspense>
  )
}

/**
 * Loading skeleton for admin dashboard
 */
function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-white border-2 border-black rounded-lg animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>

          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
