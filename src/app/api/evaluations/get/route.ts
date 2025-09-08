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
    const evaluationId = searchParams.get('evaluationId');

    if (!useCaseId && !evaluationId) {
      return NextResponse.json(
        { error: 'Missing useCaseId or evaluationId parameter' },
        { status: 400 }
      );
    }

    // Fetch evaluation by id or latest by useCaseId
    let evaluation: any = null;
    if (evaluationId) {
      evaluation = await prismaClient.evaluation.findUnique({
        where: { id: evaluationId }
      });
    } else if (useCaseId) {
      evaluation = await prismaClient.evaluation.findFirst({
        where: { useCaseId },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!evaluation) {
      return NextResponse.json({
        success: true,
        evaluationConfig: null,
        results: [],
        summary: null
      });
    }

    // Fetch results for this evaluation, if any
    const results = await prismaClient.evaluationResult.findMany({
      where: { evaluationId: evaluation.id }
    });

    // Return normalized payload expected by frontend
    return NextResponse.json({
      success: true,
      evaluationId: evaluation.id,
      status: evaluation.status,
      completedAt: evaluation.completedAt,
      summary: evaluation.summary || null,
      evaluationConfig: {
        ...(evaluation.configuration || {}),
        id: evaluation.id
      },
      results
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


