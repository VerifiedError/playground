import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WORKFLOW_TEMPLATES, listWorkflowTemplates } from '@/lib/workflow-engine'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/workflows
 * Get all workflows for the current user (including templates)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const includeTemplates = searchParams.get('templates') === 'true'

    // Get user workflows
    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Parse config JSON
    const formatted = workflows.map((workflow) => ({
      ...workflow,
      config: JSON.parse(workflow.config),
    }))

    // Add built-in templates if requested
    let templates: any[] = []
    if (includeTemplates) {
      templates = listWorkflowTemplates().map((template) => ({
        id: `template-${template.name}`,
        name: template.name,
        description: template.description,
        category: template.category,
        isTemplate: true,
        config: WORKFLOW_TEMPLATES[template.name],
      }))
    }

    return NextResponse.json({
      workflows: formatted,
      templates,
    })
  } catch (error: any) {
    console.error('GET /api/workflows error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { name, description, config, category, isTemplate } = body

    if (!name || !config) {
      return NextResponse.json({ error: 'Missing required fields: name, config' }, { status: 400 })
    }

    // Validate config structure
    if (!config.agents || !config.steps) {
      return NextResponse.json({ error: 'Invalid workflow config: must include agents and steps' }, { status: 400 })
    }

    // Create workflow
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description: description || null,
        config: JSON.stringify(config),
        category: category || 'Custom',
        isTemplate: isTemplate || false,
      },
    })

    // Parse config for response
    const formatted = {
      ...workflow,
      config: JSON.parse(workflow.config),
    }

    return NextResponse.json({ workflow: formatted }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/workflows error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
