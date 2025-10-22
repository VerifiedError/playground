/**
 * Credit Management System for Serper.dev API
 *
 * Tracks and limits API usage with strict rules to prevent overspending.
 * Credits are stored in localStorage with daily/monthly tracking.
 */

export interface CreditLimits {
  // Per-search limits
  maxResultsPerSearch: number // Maximum num parameter (1-100)
  warnAtResults: number // Warn when approaching limit

  // Daily limits
  maxDailySearches: number // Maximum searches per day
  maxDailyResults: number // Maximum total results per day
  warnAtDailySearches: number // Warn when approaching daily search limit
  warnAtDailyResults: number // Warn when approaching daily results limit

  // Monthly limits
  maxMonthlySearches: number // Maximum searches per month
  maxMonthlyResults: number // Maximum total results per month
  warnAtMonthlySearches: number // Warn when approaching monthly search limit
  warnAtMonthlyResults: number // Warn when approaching monthly results limit

  // Strict mode
  strictMode: boolean // Block requests when limits are reached (no warnings, hard stop)
  blockBatchRequests: boolean // Prevent batch searches entirely
}

export interface CreditUsage {
  // Today's usage
  dailySearches: number
  dailyResults: number
  dailyDate: string // YYYY-MM-DD

  // This month's usage
  monthlySearches: number
  monthlyResults: number
  monthlyPeriod: string // YYYY-MM

  // All-time usage
  totalSearches: number
  totalResults: number

  // Last search
  lastSearchAt: string // ISO timestamp
}

export interface CreditCheck {
  allowed: boolean
  reason?: string
  warning?: string
  usage: CreditUsage
  limits: CreditLimits
}

// Default strict limits
export const DEFAULT_CREDIT_LIMITS: CreditLimits = {
  maxResultsPerSearch: 20, // Conservative: 20 results per search
  warnAtResults: 15,

  maxDailySearches: 50, // 50 searches per day
  maxDailyResults: 500, // 500 total results per day (50 searches × 10 avg)
  warnAtDailySearches: 40,
  warnAtDailyResults: 400,

  maxMonthlySearches: 1000, // 1,000 searches per month (within free tier)
  maxMonthlyResults: 10000, // 10,000 total results per month
  warnAtMonthlySearches: 800,
  warnAtMonthlyResults: 8000,

  strictMode: true, // Hard stop at limits (no overages)
  blockBatchRequests: true, // Prevent batch searches
}

const LIMITS_STORAGE_KEY = 'serper-credit-limits'
const USAGE_STORAGE_KEY = 'serper-credit-usage'

/**
 * Get current credit limits (from localStorage or defaults)
 */
export function getCreditLimits(): CreditLimits {
  if (typeof window === 'undefined') return DEFAULT_CREDIT_LIMITS

  const stored = localStorage.getItem(LIMITS_STORAGE_KEY)
  if (stored) {
    try {
      return { ...DEFAULT_CREDIT_LIMITS, ...JSON.parse(stored) }
    } catch (error) {
      console.error('Failed to parse stored credit limits:', error)
    }
  }
  return DEFAULT_CREDIT_LIMITS
}

/**
 * Update credit limits
 */
export function setCreditLimits(limits: Partial<CreditLimits>): void {
  if (typeof window === 'undefined') return

  const current = getCreditLimits()
  const updated = { ...current, ...limits }
  localStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Get current credit usage (from localStorage)
 */
export function getCreditUsage(): CreditUsage {
  if (typeof window === 'undefined') {
    return {
      dailySearches: 0,
      dailyResults: 0,
      dailyDate: new Date().toISOString().split('T')[0],
      monthlySearches: 0,
      monthlyResults: 0,
      monthlyPeriod: new Date().toISOString().slice(0, 7),
      totalSearches: 0,
      totalResults: 0,
      lastSearchAt: '',
    }
  }

  const stored = localStorage.getItem(USAGE_STORAGE_KEY)
  if (stored) {
    try {
      const usage = JSON.parse(stored) as CreditUsage
      const today = new Date().toISOString().split('T')[0]
      const thisMonth = new Date().toISOString().slice(0, 7)

      // Reset daily usage if it's a new day
      if (usage.dailyDate !== today) {
        usage.dailySearches = 0
        usage.dailyResults = 0
        usage.dailyDate = today
      }

      // Reset monthly usage if it's a new month
      if (usage.monthlyPeriod !== thisMonth) {
        usage.monthlySearches = 0
        usage.monthlyResults = 0
        usage.monthlyPeriod = thisMonth
      }

      return usage
    } catch (error) {
      console.error('Failed to parse stored credit usage:', error)
    }
  }

  return {
    dailySearches: 0,
    dailyResults: 0,
    dailyDate: new Date().toISOString().split('T')[0],
    monthlySearches: 0,
    monthlyResults: 0,
    monthlyPeriod: new Date().toISOString().slice(0, 7),
    totalSearches: 0,
    totalResults: 0,
    lastSearchAt: '',
  }
}

/**
 * Update credit usage after a search
 */
export function recordSearchUsage(numResults: number): void {
  if (typeof window === 'undefined') return

  const usage = getCreditUsage()
  const now = new Date().toISOString()

  usage.dailySearches++
  usage.dailyResults += numResults
  usage.monthlySearches++
  usage.monthlyResults += numResults
  usage.totalSearches++
  usage.totalResults += numResults
  usage.lastSearchAt = now

  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage))
}

/**
 * Check if a search is allowed under current limits
 */
export function checkCreditLimit(numResults: number, isBatch: boolean = false): CreditCheck {
  const limits = getCreditLimits()
  const usage = getCreditUsage()

  // Batch request check
  if (isBatch && limits.blockBatchRequests) {
    return {
      allowed: false,
      reason: 'Batch requests are blocked in your current settings. Disable "Block Batch Requests" in Credit Settings to enable.',
      usage,
      limits,
    }
  }

  // Per-search limit check (strict mode)
  if (limits.strictMode && numResults > limits.maxResultsPerSearch) {
    return {
      allowed: false,
      reason: `Search blocked: Requesting ${numResults} results exceeds per-search limit of ${limits.maxResultsPerSearch}. Lower the "Results" parameter or increase the limit in Credit Settings.`,
      usage,
      limits,
    }
  }

  // Daily search limit check (strict mode)
  if (limits.strictMode && usage.dailySearches >= limits.maxDailySearches) {
    return {
      allowed: false,
      reason: `Daily search limit reached: ${usage.dailySearches}/${limits.maxDailySearches} searches used today. Try again tomorrow or increase the limit in Credit Settings.`,
      usage,
      limits,
    }
  }

  // Daily results limit check (strict mode)
  if (limits.strictMode && usage.dailyResults + numResults > limits.maxDailyResults) {
    return {
      allowed: false,
      reason: `Daily results limit reached: ${usage.dailyResults}/${limits.maxDailyResults} results used today. This search would add ${numResults} more. Try again tomorrow or increase the limit in Credit Settings.`,
      usage,
      limits,
    }
  }

  // Monthly search limit check (strict mode)
  if (limits.strictMode && usage.monthlySearches >= limits.maxMonthlySearches) {
    return {
      allowed: false,
      reason: `Monthly search limit reached: ${usage.monthlySearches}/${limits.maxMonthlySearches} searches used this month. Try again next month or increase the limit in Credit Settings.`,
      usage,
      limits,
    }
  }

  // Monthly results limit check (strict mode)
  if (limits.strictMode && usage.monthlyResults + numResults > limits.maxMonthlyResults) {
    return {
      allowed: false,
      reason: `Monthly results limit reached: ${usage.monthlyResults}/${limits.maxMonthlyResults} results used this month. This search would add ${numResults} more. Try again next month or increase the limit in Credit Settings.`,
      usage,
      limits,
    }
  }

  // Warning checks (only if strict mode is OFF)
  let warning: string | undefined

  if (!limits.strictMode) {
    if (numResults >= limits.warnAtResults) {
      warning = `⚠️ High result count: Requesting ${numResults} results (approaching ${limits.maxResultsPerSearch} limit)`
    } else if (usage.dailySearches >= limits.warnAtDailySearches) {
      warning = `⚠️ Approaching daily search limit: ${usage.dailySearches}/${limits.maxDailySearches}`
    } else if (usage.dailyResults + numResults >= limits.warnAtDailyResults) {
      warning = `⚠️ Approaching daily results limit: ${usage.dailyResults + numResults}/${limits.maxDailyResults}`
    } else if (usage.monthlySearches >= limits.warnAtMonthlySearches) {
      warning = `⚠️ Approaching monthly search limit: ${usage.monthlySearches}/${limits.maxMonthlySearches}`
    } else if (usage.monthlyResults + numResults >= limits.warnAtMonthlyResults) {
      warning = `⚠️ Approaching monthly results limit: ${usage.monthlyResults + numResults}/${limits.maxMonthlyResults}`
    }
  }

  return {
    allowed: true,
    warning,
    usage,
    limits,
  }
}

/**
 * Reset all usage data (admin function)
 */
export function resetCreditUsage(): void {
  if (typeof window === 'undefined') return

  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().toISOString().slice(0, 7)

  const resetUsage: CreditUsage = {
    dailySearches: 0,
    dailyResults: 0,
    dailyDate: today,
    monthlySearches: 0,
    monthlyResults: 0,
    monthlyPeriod: thisMonth,
    totalSearches: 0,
    totalResults: 0,
    lastSearchAt: '',
  }

  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(resetUsage))
}

/**
 * Get formatted usage percentage
 */
export function getUsagePercentage(current: number, max: number): number {
  if (max === 0) return 0
  return Math.min(Math.round((current / max) * 100), 100)
}

/**
 * Estimate cost based on Serper.dev pricing
 * Free tier: 2,500 queries
 * Paid: $0.30 - $1.00 per 1,000 queries (average $0.50)
 */
export function estimateSearchCost(numResults: number): number {
  const COST_PER_1000_QUERIES = 0.50 // Average cost
  const COST_PER_QUERY = COST_PER_1000_QUERIES / 1000
  return COST_PER_QUERY // Each search = 1 query
}

export function estimateMonthlyCost(monthlySearches: number): number {
  const FREE_TIER_LIMIT = 2500
  if (monthlySearches <= FREE_TIER_LIMIT) {
    return 0 // Within free tier
  }
  const paidSearches = monthlySearches - FREE_TIER_LIMIT
  const COST_PER_1000_QUERIES = 0.50 // Average cost
  return (paidSearches / 1000) * COST_PER_1000_QUERIES
}

/**
 * Get credit balance as a percentage (0-100)
 * Returns the most restrictive limit (whichever is closest to being reached)
 */
export function getCreditBalance(): number {
  const usage = getCreditUsage()
  const limits = getCreditLimits()

  // Calculate percentages for each limit (100 = full, 0 = depleted)
  const dailySearchesRemaining = Math.max(0, 100 - getUsagePercentage(usage.dailySearches, limits.maxDailySearches))
  const dailyResultsRemaining = Math.max(0, 100 - getUsagePercentage(usage.dailyResults, limits.maxDailyResults))
  const monthlySearchesRemaining = Math.max(0, 100 - getUsagePercentage(usage.monthlySearches, limits.maxMonthlySearches))
  const monthlyResultsRemaining = Math.max(0, 100 - getUsagePercentage(usage.monthlyResults, limits.maxMonthlyResults))

  // Return the most restrictive (lowest) percentage
  return Math.min(
    dailySearchesRemaining,
    dailyResultsRemaining,
    monthlySearchesRemaining,
    monthlyResultsRemaining
  )
}
