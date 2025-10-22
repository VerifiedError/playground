import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * DELETE /api/admin/vercel/cache
 * Clear Next.js cache using revalidation
 * Admin-only endpoint
 */
export async function DELETE() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const userRole = (session.user as any).role
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    console.log('[Cache] Starting cache revalidation...')

    try {
      // Revalidate all paths - this clears the Next.js cache
      revalidatePath('/', 'layout')

      console.log('[Cache] Successfully revalidated cache')

      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
        details: 'Next.js cache has been revalidated. New requests will fetch fresh data.',
        clearedAt: new Date().toISOString(),
        note: 'For CDN cache, please use Vercel Dashboard: Settings > Data Cache > Purge Everything'
      })

    } catch (revalidateError: any) {
      console.error('[Cache] Revalidation error:', revalidateError)
      throw revalidateError
    }

  } catch (error: any) {
    console.error('[Cache] Error clearing cache:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
        details: error.message || 'An unexpected error occurred',
        note: 'For manual cache clearing, use Vercel Dashboard: Settings > Data Cache > Purge Everything'
      },
      { status: 500 }
    )
  }
}
