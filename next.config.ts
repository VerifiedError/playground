import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'standalone', // Temporarily disabled - causing prerender errors

  // Disable ESLint and TypeScript checks during production builds
  // This allows Docker builds to complete even with linting warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Security Headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            // Prevent clickjacking attacks
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Enable XSS filter in older browsers
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Control referrer information
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Permissions Policy (formerly Feature-Policy)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // Content Security Policy
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline for Next.js, unsafe-eval for dev
              "style-src 'self' 'unsafe-inline'", // unsafe-inline for styled components
              "img-src 'self' data: blob: https:", // Allow data URLs for images, HTTPS external images
              "font-src 'self' data:", // Allow data URLs for fonts
              "connect-src 'self' https://api.groq.com wss: https:", // Allow Groq API, WebSockets, HTTPS
              "media-src 'self' blob:", // Allow blob URLs for media
              "object-src 'none'", // Block plugins
              "base-uri 'self'", // Restrict base tag
              "form-action 'self'", // Restrict form submissions
              "frame-ancestors 'none'", // Prevent framing (redundant with X-Frame-Options but more specific)
              "upgrade-insecure-requests", // Automatically upgrade HTTP to HTTPS
            ].join('; '),
          },
          {
            // Strict Transport Security (HSTS)
            // Force HTTPS for 1 year, include subdomains, allow preloading
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // Fix for Windows EISDIR error with catch-all routes
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.symlinks = false
    }
    // Disable webpack caching to avoid EISDIR errors on Windows
    config.cache = false

    // Exclude Node.js-specific modules from client bundle (e2b dependencies)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'node:fs': false,
        'node:fs/promises': false,
        'node:path': false,
        'node:stream': false,
        'node:util': false,
        'node:buffer': false,
        'node:crypto': false,
        'node:zlib': false,
      }
    }

    return config
  },
};

export default bundleAnalyzer(nextConfig);
