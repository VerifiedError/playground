import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PATCH /api/presets/[id] - Update preset
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, config } = body

    // Check preset exists and belongs to user
    const existingPreset = await prisma.modelPreset.findUnique({
      where: { id },
    })

    if (!existingPreset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    if (existingPreset.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Cannot edit global presets
    if (existingPreset.isGlobal) {
      return NextResponse.json({ error: 'Cannot edit global presets' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description || null

    if (config !== undefined) {
      // Validate config is valid JSON
      let configString: string
      try {
        configString = typeof config === 'string' ? config : JSON.stringify(config)
        JSON.parse(configString) // Validate it's valid JSON
        updateData.config = configString
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid config: must be valid JSON' },
          { status: 400 }
        )
      }
    }

    const preset = await prisma.modelPreset.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ preset })
  } catch (error: any) {
    console.error('Update preset error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/presets/[id] - Delete preset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check preset exists and belongs to user
    const existingPreset = await prisma.modelPreset.findUnique({
      where: { id },
    })

    if (!existingPreset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    if (existingPreset.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Cannot delete global or default presets
    if (existingPreset.isGlobal) {
      return NextResponse.json({ error: 'Cannot delete global presets' }, { status: 403 })
    }

    if (existingPreset.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default preset' }, { status: 403 })
    }

    await prisma.modelPreset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete preset error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
