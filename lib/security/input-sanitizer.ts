/**
 * Input Sanitization Utilities
 *
 * Prevents XSS attacks by sanitizing user input before storage and rendering.
 * Uses DOMPurify for HTML/text sanitization.
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * Removes dangerous tags and attributes while preserving safe formatting.
 * Safe tags: p, br, strong, em, u, a, code, pre, ul, ol, li, blockquote
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'code',
      'pre',
      'ul',
      'ol',
      'li',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitize plain text (strip all HTML)
 *
 * Removes all HTML tags and returns plain text only.
 * Use for: chat messages, usernames, search queries, file names
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Strip all HTML tags
  const cleaned = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  })

  // Trim whitespace
  return cleaned.trim()
}

/**
 * Sanitize code snippets
 *
 * Preserves code formatting but removes dangerous scripts.
 * Use for: code blocks, JSON, configuration files
 */
export function sanitizeCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(code, {
    ALLOWED_TAGS: ['pre', 'code', 'span'],
    ALLOWED_ATTR: ['class'], // For syntax highlighting classes
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 *
 * Returns empty string if URL is dangerous.
 * Use for: link hrefs, image sources, redirects
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const cleaned = url.trim().toLowerCase()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  for (const protocol of dangerousProtocols) {
    if (cleaned.startsWith(protocol)) {
      console.warn(`[Security] Blocked dangerous URL protocol: ${protocol}`)
      return ''
    }
  }

  // Only allow http, https, mailto
  if (
    !cleaned.startsWith('http://') &&
    !cleaned.startsWith('https://') &&
    !cleaned.startsWith('mailto:') &&
    !cleaned.startsWith('/') &&
    !cleaned.startsWith('#')
  ) {
    console.warn(`[Security] Blocked non-standard URL: ${cleaned}`)
    return ''
  }

  return url.trim()
}

/**
 * Sanitize file name to prevent path traversal
 *
 * Removes directory separators and dangerous characters.
 * Use for: uploaded file names, generated file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'untitled.txt'
  }

  // Remove path separators and dangerous characters
  let cleaned = fileName
    .replace(/[\/\\]/g, '') // Remove slashes
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove Windows-forbidden characters
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Remove control characters
    .trim()

  // Ensure file name is not empty
  if (cleaned.length === 0) {
    cleaned = 'untitled.txt'
  }

  // Limit length to 255 characters (common filesystem limit)
  if (cleaned.length > 255) {
    const ext = cleaned.substring(cleaned.lastIndexOf('.'))
    const base = cleaned.substring(0, 255 - ext.length)
    cleaned = base + ext
  }

  return cleaned
}

/**
 * Sanitize JSON input
 *
 * Parses and re-stringifies JSON to ensure it's safe.
 * Returns null if JSON is invalid.
 */
export function sanitizeJson(json: string): object | null {
  if (!json || typeof json !== 'string') {
    return null
  }

  try {
    // Parse to validate structure
    const parsed = JSON.parse(json)

    // Recursively sanitize string values
    const sanitized = sanitizeJsonObject(parsed)

    return sanitized
  } catch (error) {
    console.warn('[Security] Invalid JSON input:', error)
    return null
  }
}

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeJsonObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeJsonObject)
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize keys too
      const cleanKey = sanitizeText(key)
      sanitized[cleanKey] = sanitizeJsonObject(value)
    }
    return sanitized
  }

  return obj
}

/**
 * Sanitize email address
 *
 * Validates and sanitizes email format.
 * Returns empty string if invalid.
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const cleaned = email.trim().toLowerCase()

  // Basic email regex validation
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
  if (!emailRegex.test(cleaned)) {
    console.warn('[Security] Invalid email format:', cleaned)
    return ''
  }

  return cleaned
}

/**
 * Sanitize chat message before storage
 *
 * Removes HTML and dangerous content from user messages.
 * Use this for all user-generated chat messages.
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return ''
  }

  // Strip HTML and trim
  let cleaned = sanitizeText(message)

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}
