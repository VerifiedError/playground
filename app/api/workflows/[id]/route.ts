import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/workflows/[id]
 * Get a specific workflow by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(session.user.id)

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Check ownership
    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse config
    const formatted = {
      ...workflow,
      config: JSON.parse(workflow.config),
      runs: workflow.runs.map((run) => ({
        ...run,
        input: run.input ? JSON.parse(run.input) : null,
        output: run.output ? JSON.parse(run.output) : null,
        stepResults: run.stepResults ? JSON.parse(run.stepResults) : [],
      })),
    }

    return NextResponse.json({ workflow: formatted })
  } catch (error: any) {
    console.error('GET /api/workflows/[id] error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/workflows/[id]
 * Update a workflow (only if user owns it)
 */
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
    const userId = parseInt(session.user.id)

    // Check ownership
    const existing = await prisma.workflow.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, config, category, isTemplate } = body

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (config !== undefined) {
      // Validate config structure
      if (!config.agents || !config.steps) {
        return NextResponse.json(
          { error: 'Invalid workflow config: must include agents and steps' },
          { status: 400 }
        )
      }
      updateData.config = JSON.stringify(config)
    }
    if (category !== undefined) updateData.category = category
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate

    // Update workflow
    const updated = await prisma.workflow.update({
      where: { id },
      data: updateData,
    })

    // Parse config for response
    const formatted = {
      ...updated,
      config: JSON.parse(updated.config),
    }

    return NextResponse.json({ workflow: formatted })
  } catch (error: any) {
    console.error('PATCH /api/workflows/[id] error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/workflows/[id]
 * Delete a workflow (only if user owns it)
 */
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
    const userId = parseInt(session.user.id)

    // Check ownership
    const existing = await prisma.workflow.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete workflow (cascade will delete runs)
    await prisma.workflow.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/workflows/[id] error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
