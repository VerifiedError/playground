/**
 * Serper Balance API Endpoint
 *
 * GET /api/serper/balance - Fetch current Serper.dev credit balance
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCachedSerperBalance } from '@/lib/serper-balance-fetcher'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/serper/balance
 *
 * Fetch current Serper.dev credit balance using Playwright automation.
 * Requires authentication.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch balance (with caching)
    const result = await getCachedSerperBalance()

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          creditsLeft: 0,
          lastUpdated: result.lastUpdated,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      creditsLeft: result.creditsLeft,
      lastUpdated: result.lastUpdated,
    })
  } catch (error: any) {
    console.error('Error in /api/serper/balance:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch balance',
        creditsLeft: 0,
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
