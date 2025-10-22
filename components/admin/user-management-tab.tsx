'use client'

import { useEffect, useState } from 'react'
import {
  RefreshCw,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  Check,
  X as XIcon,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  MessageSquare,
  DollarSign,
  Activity,
  Eye,
  Key,
  Ban,
  Download,
  Mail,
  Zap,
  BarChart3,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { UserDetailsPanel } from './user-details-panel'

interface User {
  id: number
  email: string
  username: string
  name: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  _count: {
    agenticSessions: number
  }
}

export function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [detailedUserId, setDetailedUserId] = useState<number | null>(null)
  const [detailedUsername, setDetailedUsername] = useState<string>('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (activeFilter) params.append('active', activeFilter)

      const response = await fetch(`/api/admin/users?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, activeFilter])

  const handleToggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      toast.success(`User role updated to ${newRole}`)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      toast.success(`User "${username}" deleted successfully`)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleResetPassword = async (userId: number, username: string) => {
    // TODO: Implement password reset functionality
    toast.info('Password reset feature coming soon')
  }

  const handleViewSessions = (userId: number) => {
    // TODO: Navigate to sessions filtered by user
    toast.info('Navigate to Sessions tab to view user sessions')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            User Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {users.length} total user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-white border-2 border-black rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Table
            </button>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 border-2 border-black transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-3 md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white border-2 border-black rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-3 bg-white border-2 border-black rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Card View (Mobile-First) */}
      {(viewMode === 'cards' || window.innerWidth < 768) && (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg border-2 border-black overflow-hidden transition-all"
            >
              {/* Card Header - Always Visible */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-semibold text-white">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {user.username}
                        </p>
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border-2 border-purple-500">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {user._count.agenticSessions} sessions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(user.lastLoginAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Expand */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        user.isActive
                          ? 'bg-green-50 text-green-700 border-green-500'
                          : 'bg-red-50 text-red-700 border-red-500'
                      }`}
                    >
                      {user.isActive ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <XIcon className="w-3 h-3" />
                      )}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {expandedUserId === user.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedUserId === user.id && (
                <div className="border-t-2 border-black bg-gray-50">
                  {/* Detailed Info Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Account Details
                      </h4>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm text-gray-900 break-all">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">User ID</p>
                            <p className="text-sm text-gray-900 font-mono">#{user.id}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="text-sm text-gray-900 font-medium capitalize">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Activity & Stats
                      </h4>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm text-gray-900">{formatDateTime(user.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Activity className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Last Updated</p>
                            <p className="text-sm text-gray-900">{formatDateTime(user.updatedAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Last Login</p>
                            <p className="text-sm text-gray-900">
                              {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Total Sessions</p>
                            <p className="text-sm text-gray-900 font-semibold">
                              {user._count.agenticSessions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t-2 border-black flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setDetailedUserId(user.id)
                        setDetailedUsername(user.username)
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white border-2 border-black rounded-lg hover:bg-gray-800 transition-colors min-h-[44px]"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Detailed Analytics
                    </button>

                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
                    >
                      <Shield className="w-4 h-4" />
                      {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm border-2 rounded-lg transition-colors min-h-[44px] ${
                        user.isActive
                          ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <Ban className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleViewSessions(user.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
                    >
                      <Eye className="w-4 h-4" />
                      View Sessions
                    </button>

                    <button
                      onClick={() => handleResetPassword(user.id, user.username)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
                    >
                      <Key className="w-4 h-4" />
                      Reset Password
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 border-2 border-red-500 text-red-700 rounded-lg hover:bg-red-100 transition-colors min-h-[44px] ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table View (Desktop Only) */}
      {viewMode === 'table' && window.innerWidth >= 768 && (
        <div className="bg-white rounded-lg border-2 border-black overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 min-h-[32px] ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-500'
                          : 'bg-gray-50 text-gray-700 border-gray-400'
                      }`}
                    >
                      {user.role === 'admin' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )}
                      {user.role}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 min-h-[32px] ${
                        user.isActive
                          ? 'bg-green-50 text-green-700 border-green-500'
                          : 'bg-red-50 text-red-700 border-red-500'
                      }`}
                    >
                      {user.isActive ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <XIcon className="w-3 h-3" />
                      )}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {user._count.agenticSessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setDetailedUserId(user.id)
                          setDetailedUsername(user.username)
                        }}
                        className="p-2 text-black hover:bg-black hover:text-white rounded transition-colors border-2 border-black"
                        title="View Detailed Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-black">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No users found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Detailed Analytics Panel (Full Screen Overlay) */}
      {detailedUserId && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setDetailedUserId(null)
                setDetailedUsername('')
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <XCircle className="w-6 h-6 text-gray-900" />
            </button>
            <UserDetailsPanel userId={detailedUserId} username={detailedUsername} />
          </div>
        </div>
      )}
    </div>
  )
}
