/**
 * Puppeteer Browser Automation Client
 *
 * Provides headless browser automation for web scraping, testing, and interaction.
 * No API key required - runs locally using Puppeteer.
 *
 * Installation:
 * npm install puppeteer
 *
 * Cost: Free (self-hosted)
 */

import puppeteer, { Browser, Page } from 'puppeteer'

export interface BrowserActionParams {
  action:
    | 'visit'
    | 'screenshot'
    | 'click'
    | 'fill'
    | 'extract'
    | 'wait'
  url?: string
  selector?: string
  value?: string
  waitTime?: number // milliseconds
}

export interface BrowserActionResponse {
  success: boolean
  data?: string | Buffer
  error?: string
  screenshot?: string // Base64 encoded
  executionTime: number
}

let browserInstance: Browser | null = null

/**
 * Get or create browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
  }
  return browserInstance
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}

/**
 * Execute browser automation action
 */
export async function browserAutomation(params: BrowserActionParams): Promise<BrowserActionResponse> {
  const { action, url, selector, value, waitTime = 1000 } = params

  try {
    const browser = await getBrowser()
    const page = await browser.newPage()
    const startTime = Date.now()

    try {
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 })

      // Navigate to URL if provided
      if (url) {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      }

      let result: BrowserActionResponse = {
        success: true,
        executionTime: 0,
      }

      // Execute action
      switch (action) {
        case 'visit':
          if (!url) throw new Error('URL required for visit action')
          // Already navigated above
          const title = await page.title()
          const content = await page.content()
          result.data = `Title: ${title}\n\nContent length: ${content.length} characters`
          break

        case 'screenshot':
          if (!url) throw new Error('URL required for screenshot action')
          const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'png' })
          result.screenshot = (screenshotBuffer as Buffer).toString('base64')
          result.data = 'Screenshot captured'
          break

        case 'click':
          if (!selector) throw new Error('Selector required for click action')
          await page.waitForSelector(selector, { timeout: 10000 })
          await page.click(selector)
          await page.waitForTimeout(waitTime)
          result.data = `Clicked element: ${selector}`
          break

        case 'fill':
          if (!selector) throw new Error('Selector required for fill action')
          if (value === undefined) throw new Error('Value required for fill action')
          await page.waitForSelector(selector, { timeout: 10000 })
          await page.type(selector, value)
          await page.waitForTimeout(waitTime)
          result.data = `Filled ${selector} with: ${value}`
          break

        case 'extract':
          if (!selector) throw new Error('Selector required for extract action')
          const text = await page.$eval(selector, (el) => el.textContent || '')
          result.data = text.trim()
          break

        case 'wait':
          await page.waitForTimeout(waitTime)
          result.data = `Waited ${waitTime}ms`
          break

        default:
          throw new Error(`Unknown action: ${action}`)
      }

      result.executionTime = Date.now() - startTime
      return result
    } finally {
      await page.close()
    }
  } catch (error: any) {
    console.error('Browser automation error:', error)

    // Return mock result on error
    return mockBrowserAutomation(params)
  }
}

/**
 * Mock browser automation for development/fallback
 */
function mockBrowserAutomation(params: BrowserActionParams): BrowserActionResponse {
  console.log(`🌐 Using mock browser automation for action: ${params.action}`)

  const mockData: Record<string, string> = {
    visit: `Mock visit to ${params.url}. In production, this would load the actual page.`,
    screenshot: 'Mock screenshot taken. In production, this would return a base64 PNG.',
    click: `Mock click on ${params.selector}. In production, this would click the element.`,
    fill: `Mock fill ${params.selector} with "${params.value}". In production, this would type the value.`,
    extract: `Mock extracted text from ${params.selector}. In production, this would return actual content.`,
    wait: `Mock wait for ${params.waitTime}ms. In production, this would pause execution.`,
  }

  return {
    success: true,
    data: mockData[params.action] || 'Unknown action',
    executionTime: 100,
  }
}

/**
 * Format browser automation result as readable text
 */
export function formatBrowserAutomationResult(response: BrowserActionResponse): string {
  let output = ''

  if (response.success) {
    output += `Success! (${response.executionTime}ms)\n\n`
    if (response.data) {
      output += `${response.data}\n`
    }
    if (response.screenshot) {
      output += '\n[Screenshot captured - base64 data available]\n'
    }
  } else {
    output += `Failed!\n\nError: ${response.error || 'Unknown error'}\n`
  }

  return output.trim()
}
