import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/config
 * Get application configuration (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    // Get the first (and only) settings record
    let settings = await prisma.adminSettings.findFirst()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {}, // Uses default values from schema
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/config
 * Update application configuration (admin only)
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = await request.json()

    // Validate input
    const allowedFields = [
      'siteName',
      'siteDescription',
      'logoUrl',
      'supportEmail',
      'enableRegistration',
      'enableVisionModels',
      'enableFileUploads',
      'enableSessionSharing',
      'maxUploadSizeMB',
      'maxImagesPerMsg',
      'globalRateLimit',
      'sessionTimeoutMin',
      'maxTokensPerRequest',
      'defaultModel',
    ]

    // Filter to only allowed fields
    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Get existing settings or create if not exists
    let settings = await prisma.adminSettings.findFirst()

    if (settings) {
      // Update existing settings
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: updateData,
      })
    } else {
      // Create new settings with update data
      settings = await prisma.adminSettings.create({
        data: updateData,
      })
    }

    return NextResponse.json({
      message: 'Configuration updated successfully',
      settings,
    })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}
