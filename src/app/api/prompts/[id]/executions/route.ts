import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';
import { PrismaClient } from '@/generated/prisma';
import { prismaClient } from '@/utils/db';

const prisma = new PrismaClient();

export const GET = withAuth(async (
  request: Request,
  { params, auth }: { params: Promise<{ id: string }>, auth: any }
) => {
  try {
    const { userId: clerkUserId } = auth;
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Map Clerk user ID to internal user ID
    const userRecord = await prismaClient.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!userRecord) {
      return NextResponse.json({ executions: [] });
    }

    const resolvedParams = await params;
    const promptId = resolvedParams.id;

    const executions = await prisma.promptTestRun.findMany({
      where: {
        promptTemplateId: promptId,
        userId: userRecord.id,
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
        inputTokens: exec.inputTokens ?? Math.ceil(JSON.stringify(exec.requestContent).length / 4),
        outputTokens: exec.outputTokens ?? Math.ceil((exec.responseContent || '').length / 4),
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