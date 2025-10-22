'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, User, Lock } from 'lucide-react'
import { PasswordInput } from './password-input'
import Link from 'next/link'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .trim()
    .toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo = '/' }: LoginFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    setIsLoading(true)

    try {
      // Check CSRF token first
      try {
        const csrfResponse = await fetch('/api/auth/csrf')
        const csrfData = await csrfResponse.json()

        if (!csrfData.csrfToken) {
          setError('Security token missing. Please refresh the page and try again.')
          setIsLoading(false)
          return
        }
      } catch (csrfErr) {
        setError('Failed to obtain security token. Please check your internet connection.')
        setIsLoading(false)
        return
      }

      // Attempt sign in
      try {
        const result = await signIn('credentials', {
          username: data.username,
          password: data.password,
          callbackUrl: redirectTo,
          redirect: false,
        })

        if (result?.ok) {
          // Success - redirect to destination
          const redirectUrl = result.url || redirectTo
          setTimeout(() => {
            window.location.href = redirectUrl
          }, 500)
        } else {
          // Failed - show error
          setError(result?.error || 'Invalid username or password. Please try again.')
          setIsLoading(false)
        }
      } catch (signInErr) {
        // Handle authentication errors
        if (signInErr instanceof TypeError && signInErr.message.includes('fetch')) {
          setError('Network error. Please check your internet connection.')
        } else {
          const errorMessage = signInErr instanceof Error ? signInErr.message : 'Authentication error'
          setError(`Authentication failed: ${errorMessage}`)
        }
        setIsLoading(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during login'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Username
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <User className="w-5 h-5" />
          </div>
          <input
            id="username"
            type="text"
            autoComplete="username"
            autoFocus
            disabled={isLoading}
            className={`w-full pl-11 pr-4 py-3 text-base bg-white border-2 rounded-lg transition-all focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
              errors.username
                ? 'border-red-500'
                : 'border-black'
            }`}
            placeholder="Enter your username"
            {...register('username')}
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">
            <Lock className="w-5 h-5" />
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="Enter your password"
            error={errors.password?.message}
            className="pl-11"
            borderColor="black"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            disabled={isLoading}
            className="w-4 h-4 border-2 border-black rounded focus:ring-gray-900 disabled:opacity-50"
            {...register('rememberMe')}
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 text-sm text-gray-700"
          >
            Remember me
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 min-h-[44px] bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 focus:ring-4 focus:ring-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-gray-900 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </form>
  )
}
