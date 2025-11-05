import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';
import { prismaClient } from '@/utils/db';
import { buildStepsDataFromQnA } from '@/lib/steps-from-qna';
import { calculateRiskScores } from '@/lib/risk-calculations';

export const GET = withAuth(async (
  request: Request,
  { params, auth }: { params: Promise<{ useCaseId: string }>, auth: any }
) => {
  try {
    const { useCaseId } = await params;
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug') === 'true';

    // Verify user and use case access
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      select: { id: true, userId: true, organizationId: true }
    });
    if (!useCase) return NextResponse.json({ error: 'Use case not found' }, { status: 404 });

    // Check permissions (requireUser: true ensures auth.userId exists)
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
      select: { id: true, role: true, organizationId: true }
    });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const hasPermission = userRecord.role === 'QZEN_ADMIN' ||
      (userRecord.role === 'ORG_ADMIN' && useCase.organizationId === userRecord.organizationId) ||
      (userRecord.role === 'ORG_USER' && useCase.organizationId === userRecord.organizationId) ||
      useCase.userId === userRecord.id;
    if (!hasPermission) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // Fetch QnA using the same endpoints used in Assess/Approvals
    const origin = new URL(request.url).origin;
    const endpoint = useCase.organizationId
      ? `${origin}/api/get-assess-questions?useCaseId=${useCaseId}`
      : `${origin}/api/get-assess-question-templates?useCaseId=${useCaseId}`;

    const res = await fetch(endpoint, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: 'Failed to fetch questions', details: text }, { status: 500 });
    }

    const qna = await res.json();
    const steps = buildStepsDataFromQnA(Array.isArray(qna) ? qna : []);
    const calc = calculateRiskScores(steps as any);

    const result = {
      score: calc.score,
      riskTier: calc.riskTier,
      chartData: calc.chartData,
      regulatoryWarnings: calc.regulatoryWarnings,
      dataPrivacyInfo: calc.dataPrivacyInfo,
      securityInfo: calc.securityInfo,
      operationalInfo: calc.operationalInfo,
      ethicalInfo: calc.ethicalInfo,
      ...(debug && { debug: { qnaData: qna, stepsData: steps } })
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[risk-score] error', error);
    return NextResponse.json({ error: 'Failed to compute risk score' }, { status: 500 });
  }
}, { requireUser: true });


