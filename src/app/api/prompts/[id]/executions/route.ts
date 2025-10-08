import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export const GET = withAuth(async (
  request: Request,
  { params, auth }: { params: { id: string }, auth: any }
) => {
  try {
    const { userId } = auth;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = params.id;

    const executions = await prisma.promptTestRun.findMany({
      where: {
        promptTemplateId: promptId,
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
      include: {
        PromptTemplate: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      executions: executions.map(exec => ({
        id: exec.id,
        promptId: exec.promptTemplateId,
        promptName: exec.PromptTemplate.name,
        versionId: exec.versionId,
        provider: exec.service,
        model: exec.model,
        response: exec.responseContent,
        inputTokens: Math.ceil(JSON.stringify(exec.requestContent).length / 4),
        outputTokens: Math.ceil((exec.responseContent || '').length / 4),
        totalTokens: exec.tokensUsed,
        cost: exec.cost,
        latencyMs: exec.latencyMs,
        status: exec.status.toLowerCase(),
        error: exec.error,
        timestamp: exec.createdAt.toISOString(),
        settings: exec.settings as any,
        variables: exec.variables as Record<string, string>
      }))
    });

  } catch (error: any) {
    console.error('Error fetching execution history:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}, { requireUser: true });