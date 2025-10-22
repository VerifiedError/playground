import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkflowEngine, saveWorkflowRun, getWorkflowTemplate } from '@/lib/workflow-engine'
import { WorkflowContext } from '@/lib/agents'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/workflows/[id]/run
 * Execute a workflow
 */
export async function POST(
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
    const body = await request.json()
    const { input, sessionId } = body

    // Fetch workflow
    let workflow
    let workflowConfig

    // Check if it's a template (starts with "template-")
    if (id.startsWith('template-')) {
      const templateName = id.replace('template-', '')
      workflowConfig = getWorkflowTemplate(templateName)
      if (!workflowConfig) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
    } else {
      // Regular workflow from database
      workflow = await prisma.workflow.findUnique({
        where: { id },
      })

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }

      // Check ownership
      if (workflow.userId !== userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      workflowConfig = JSON.parse(workflow.config)
    }

    // Merge user input into workflow config
    workflowConfig.input = { ...workflowConfig.input, ...input }

    // Create workflow context
    const context: WorkflowContext = {
      sessionId: sessionId || undefined,
      userId,
      variables: {},
      stepResults: {},
      groqApiKey: process.env.GROQ_API_KEY,
    }

    // Execute workflow
    const engine = new WorkflowEngine(workflowConfig, context)
    const result = await engine.execute()

    // Save workflow run to database (if not a template)
    let runId: string | undefined
    if (workflow) {
      runId = await saveWorkflowRun(workflow.id, result, sessionId)

      // Increment use count
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          useCount: { increment: 1 },
        },
      })
    }

    return NextResponse.json({
      success: true,
      runId,
      result: {
        status: result.status,
        output: result.output,
        stepResults: result.stepResults,
        error: result.error,
        totalDuration: result.totalDuration,
      },
    })
  } catch (error: any) {
    console.error('POST /api/workflows/[id]/run error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/workflows/[id]/run
 * Get all runs for a workflow
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

    // Check ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get runs
    const runs = await prisma.workflowRun.findMany({
      where: { workflowId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })

    // Parse JSON fields
    const formatted = runs.map((run) => ({
      ...run,
      input: run.input ? JSON.parse(run.input) : null,
      output: run.output ? JSON.parse(run.output) : null,
      stepResults: run.stepResults ? JSON.parse(run.stepResults) : [],
    }))

    return NextResponse.json({ runs: formatted })
  } catch (error: any) {
    console.error('GET /api/workflows/[id]/run error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
