import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const useCaseId = searchParams.get('useCaseId');

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'Missing useCaseId parameter' },
        { status: 400 }
      );
    }

    // Get the latest guardrail for this use case
    const guardrail = await prismaClient.guardrail.findFirst({
      where: { useCaseId },
      orderBy: { createdAt: 'desc' },
      include: {
        rules: true
      }
    });

    if (!guardrail) {
      // Return success with empty payload instead of 404 to avoid noisy errors client-side
      return NextResponse.json({
        success: true,
        guardrails: null,
        rules: [],
        id: null,
        status: null,
        confidence: null,
        metadata: null
      });
    }

    // Return the guardrail configuration with the correct structure
    return NextResponse.json({
      success: true,
      guardrails: guardrail.configuration, // Frontend expects 'guardrails' not 'guardrail'
      rules: guardrail.rules,
      id: guardrail.id,
      status: guardrail.status,
      confidence: guardrail.confidence,
      metadata: {
        createdAt: guardrail.createdAt,
        updatedAt: guardrail.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching guardrails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guardrails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}