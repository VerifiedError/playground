import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define protected routes
const protectedRoutes = ['/', '/playground', '/search', '/analytics']

// Define public routes (no auth required)
const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response with security headers
  const response = NextResponse.next()

  // ============================================
  // SECURITY HEADERS (Production-Ready)
  // ============================================

  // HSTS - Force HTTPS for 1 year, include subdomains
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy - send only origin when cross-origin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy - disable unused browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Content Security Policy - Strict security for scripts/styles
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' https://r2cdn.perplexity.ai;
    connect-src 'self' https://api.groq.com https://serpapi.com https://serper.dev https://www.google.com https://vercel.live;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  // Remove server information disclosure
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  // ============================================
  // AUTHENTICATION CHECK
  // ============================================

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Allow public routes and API auth routes to pass through
  if (isPublicRoute || pathname.startsWith('/api/auth')) {
    return response
  }

  // API routes require token but handle auth internally
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!isProtectedRoute) {
    return response
  }

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token, redirect to login with return URL
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ============================================
  // ADMIN ROUTE PROTECTION
  // ============================================

  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute && token.role !== 'admin') {
    // Redirect non-admin users to home
    return NextResponse.redirect(new URL('/', request.url))
  }

  // User is authenticated, allow access
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
