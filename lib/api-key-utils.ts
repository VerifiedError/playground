/**
 * API Key Utilities
 *
 * Handles API key generation, validation, and hashing for external API access.
 *
 * Key Format: pk_{env}_{random_string}
 * - pk = "playground key" prefix
 * - env = "live" or "test"
 * - random_string = 32-character cryptographically secure random string
 *
 * Example: pk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 */

import crypto from 'crypto'

// API key configuration
export const API_KEY_LENGTH = 32 // Length of the random portion
export const API_KEY_PREFIX_LIVE = 'pk_live_'
export const API_KEY_PREFIX_TEST = 'pk_test_'

/**
 * Generate a new API key
 * @param env - Environment: 'live' or 'test'
 * @returns Object with the full key and its prefix
 */
export function generateApiKey(env: 'live' | 'test' = 'live'): { key: string; prefix: string } {
  const randomString = crypto.randomBytes(API_KEY_LENGTH).toString('hex').substring(0, API_KEY_LENGTH)
  const prefix = env === 'live' ? API_KEY_PREFIX_LIVE : API_KEY_PREFIX_TEST
  const key = `${prefix}${randomString}`

  // Return the full key and a visible prefix (first 12 chars for display)
  return {
    key,
    prefix: key.substring(0, 12), // e.g., "pk_live_a1b2"
  }
}

/**
 * Hash an API key for storage
 * Uses SHA-256 to securely hash the API key
 * @param key - The plain text API key
 * @returns SHA-256 hash of the key
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Verify an API key against a hash
 * @param key - The plain text API key to verify
 * @param hash - The stored hash to compare against
 * @returns True if the key matches the hash
 */
export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key)
  return keyHash === hash
}

/**
 * Validate API key format
 * Ensures the key matches the expected format
 * @param key - The API key to validate
 * @returns True if the key format is valid
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Check if key starts with pk_live_ or pk_test_
  const hasValidPrefix = key.startsWith(API_KEY_PREFIX_LIVE) || key.startsWith(API_KEY_PREFIX_TEST)

  if (!hasValidPrefix) {
    return false
  }

  // Extract the random portion
  const randomPortion = key.replace(API_KEY_PREFIX_LIVE, '').replace(API_KEY_PREFIX_TEST, '')

  // Check if it's exactly 32 characters and hexadecimal
  return randomPortion.length === API_KEY_LENGTH && /^[a-f0-9]+$/.test(randomPortion)
}

/**
 * Extract the visible prefix from an API key (for display purposes)
 * @param key - The full API key
 * @returns The visible prefix (e.g., "pk_live_a1b2")
 */
export function getApiKeyPrefix(key: string): string {
  return key.substring(0, 12)
}

/**
 * Mask an API key for display
 * Shows only the prefix and last 4 characters
 * @param key - The full API key
 * @returns Masked key (e.g., "pk_live_a1b2...o5p6")
 */
export function maskApiKey(key: string): string {
  if (key.length < 16) {
    return key // Too short to mask properly
  }

  const prefix = key.substring(0, 12)
  const suffix = key.substring(key.length - 4)

  return `${prefix}...${suffix}`
}

/**
 * Parse permissions from JSON string
 * @param permissionsJson - JSON string of permissions array
 * @returns Array of permission strings
 */
export function parsePermissions(permissionsJson: string): string[] {
  try {
    const parsed = JSON.parse(permissionsJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Check if a permission is granted
 * @param permissionsJson - JSON string of permissions array
 * @param requiredPermission - The permission to check for
 * @returns True if the permission is granted
 */
export function hasPermission(permissionsJson: string, requiredPermission: string): boolean {
  const permissions = parsePermissions(permissionsJson)
  return permissions.includes(requiredPermission) || permissions.includes('*') // '*' grants all permissions
}

/**
 * Validate permissions array
 * Ensures all permissions are valid
 * @param permissions - Array of permission strings
 * @returns True if all permissions are valid
 */
export function validatePermissions(permissions: string[]): boolean {
  const validPermissions = [
    '*', // All permissions
    'chat', // Chat completion API
    'sessions', // Session management API
    'models', // Model listing API
    'files', // File upload API
  ]

  return permissions.every((perm) => validPermissions.includes(perm))
}
