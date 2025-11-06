import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';
import { buildStepsDataFromAnswers } from '@/lib/mappers/answers-to-steps';
import { calculateRiskScores, type StepsData } from '@/lib/risk-calculations';

export const GET = withAuth(async (request, { params }) => {
  try {
    const { useCaseId } = await params as { useCaseId: string };
    if (!useCaseId) {
      return NextResponse.json({ error: 'useCaseId is required' }, { status: 400 });
    }

    const stepsData = await buildStepsDataFromAnswers(useCaseId) as StepsData;
    const riskResult = calculateRiskScores(stepsData);

    return NextResponse.json({
      useCaseId,
      stepsData,
      risk: riskResult,
    });
  } catch (error) {
    console.error('Error fetching per-usecase risk metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use case risk metrics' },
      { status: 500 }
    );
  }
}, { requireUser: true });


