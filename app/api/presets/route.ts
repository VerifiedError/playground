import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/presets - Get all presets for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's presets + global presets
    const presets = await prisma.modelPreset.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isGlobal: true },
        ],
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ presets })
  } catch (error: any) {
    console.error('Get presets error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/presets - Create new preset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, config } = body

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: name, config' },
        { status: 400 }
      )
    }

    // Validate config is valid JSON
    let configString: string
    try {
      configString = typeof config === 'string' ? config : JSON.stringify(config)
      JSON.parse(configString) // Validate it's valid JSON
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid config: must be valid JSON' },
        { status: 400 }
      )
    }

    const preset = await prisma.modelPreset.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        config: configString,
      },
    })

    return NextResponse.json({ preset })
  } catch (error: any) {
    console.error('Create preset error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
