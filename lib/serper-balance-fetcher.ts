/**
 * Serper.dev Account Balance Fetcher
 *
 * Uses Puppeteer (serverless-optimized) to login to Serper.dev dashboard and fetch credit balance.
 * This runs server-side only and should be called via API endpoint.
 */

import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import type { Browser, Page } from 'puppeteer-core'

// Serper.dev credentials (from environment variables for security)
const SERPER_EMAIL = process.env.SERPER_EMAIL || 'racaddisonmikkelson@gmail.com'
const SERPER_PASSWORD = process.env.SERPER_PASSWORD || 'ac783d123'

// Dashboard URL
const DASHBOARD_URL = 'https://serper.dev/dashboard'
const LOGIN_URL = 'https://serper.dev/login'

export interface SerperBalance {
  creditsLeft: number
  lastUpdated: string
  error?: string
}

/**
 * Fetch current credit balance from Serper.dev dashboard
 *
 * @returns Credit balance and timestamp
 */
export async function fetchSerperBalance(): Promise<SerperBalance> {
  let browser: Browser | null = null

  try {
    // Detect if running locally or on Vercel
    const isLocal = process.env.VERCEL !== '1'

    // Launch browser (local: system Chrome, Vercel: serverless Chromium)
    browser = await puppeteer.launch({
      args: isLocal
        ? ['--no-sandbox', '--disable-setuid-sandbox']
        : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal
        ? process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page: Page = await browser.newPage()

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    )

    // Navigate to dashboard (will redirect to login if not authenticated)
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle0' })

    // Check if we're on the login page
    const currentUrl = page.url()
    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      console.log('Not authenticated, logging in...')
      await loginToSerper(page)
    }

    // Wait for dashboard to load
    await page.waitForNetworkIdle({ timeout: 10000 })

    // Extract credit balance from the page
    // Looking for: <h2 class="chakra-heading css-1quy9ws"><span>2,442</span></h2>
    const creditsText = await page.$eval(
      'h2.chakra-heading span',
      (el) => el.textContent
    )

    if (!creditsText) {
      throw new Error('Could not find credits element on dashboard')
    }

    // Parse the number (remove commas)
    const creditsLeft = parseInt(creditsText.replace(/,/g, ''), 10)

    if (isNaN(creditsLeft)) {
      throw new Error(`Invalid credits value: ${creditsText}`)
    }

    console.log(`✅ Successfully fetched balance: ${creditsLeft} credits`)

    await browser.close()

    return {
      creditsLeft,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('❌ Error fetching Serper balance:', error)

    if (browser) {
      await browser.close()
    }

    return {
      creditsLeft: 0,
      lastUpdated: new Date().toISOString(),
      error: error.message || 'Failed to fetch balance',
    }
  }
}

/**
 * Login to Serper.dev using credentials
 *
 * @param page - Puppeteer page instance
 */
async function loginToSerper(page: Page): Promise<void> {
  try {
    // Navigate to login page if not already there
    if (!page.url().includes('/login')) {
      await page.goto(LOGIN_URL, { waitUntil: 'networkidle0' })
    }

    // Wait for email input field
    await page.waitForSelector('input[type="email"]', { visible: true, timeout: 5000 })

    // Fill in email
    await page.type('input[type="email"]', SERPER_EMAIL)

    // Fill in password
    await page.type('input[type="password"]', SERPER_PASSWORD)

    // Click login button
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })

    // Verify we're on the dashboard
    if (!page.url().includes('/dashboard')) {
      throw new Error('Login redirect failed - not on dashboard')
    }

    console.log('✅ Successfully logged in to Serper.dev')
  } catch (error: any) {
    console.error('❌ Login failed:', error)
    throw new Error(`Login failed: ${error.message}`)
  }
}

/**
 * Cache for balance to avoid too many scrapes
 */
const balanceCache = {
  balance: 0,
  timestamp: 0,
  cacheDuration: 60000, // 1 minute cache
}

/**
 * Get cached balance or fetch new one if cache is stale
 */
export async function getCachedSerperBalance(): Promise<SerperBalance> {
  const now = Date.now()

  // Return cached balance if still fresh
  if (balanceCache.timestamp && (now - balanceCache.timestamp) < balanceCache.cacheDuration) {
    console.log('📦 Returning cached balance:', balanceCache.balance)
    return {
      creditsLeft: balanceCache.balance,
      lastUpdated: new Date(balanceCache.timestamp).toISOString(),
    }
  }

  // Fetch fresh balance
  const result = await fetchSerperBalance()

  // Update cache if successful
  if (!result.error) {
    balanceCache.balance = result.creditsLeft
    balanceCache.timestamp = now
  }

  return result
}
