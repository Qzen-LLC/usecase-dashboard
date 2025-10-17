import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-gateway';

import { prismaClient } from '@/utils/db';
import { calculateRiskScores, type StepsData } from '@/lib/risk-calculations';

// POST /api/risks/[useCaseId]/auto-create - Auto-create risks from assessment data
export const POST = withAuth(async (
  request: Request,
  { params, auth }: { params: { useCaseId: string }, auth: any }
) => {
  try {
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { stepsData } = await request.json();
    const riskResult = calculateRiskScores(stepsData as StepsData);

    // Create risks for each category that has a score >= 4 (Medium or higher)
    const risksToCreate = [];

    const categoryMappings = {
      'Data Privacy': 'data',
      'Security': 'technical',
      'Regulatory': 'regulatory',
      'Ethical': 'ethical',
      'Operational': 'operational',
      'Reputational': 'business'
    };

    for (const data of riskResult.chartData) {
      if (data.desktop >= 4) { // Medium risk or higher
        const category = categoryMappings[data.month as keyof typeof categoryMappings] || 'technical';
        const riskLevel = data.desktop >= 8 ? 'Critical' : 
                         data.desktop >= 6 ? 'High' : 'Medium';

        // Get specific risk factors and info for this category
        let factors: string[] = [];
        let infoMessages: string[] = [];

        switch (category) {
          case 'data':
            factors = riskResult.dataPrivacyFactors;
            infoMessages = riskResult.dataPrivacyInfo;
            break;
          case 'technical':
            factors = riskResult.securityFactors;
            infoMessages = riskResult.securityInfo;
            break;
          case 'regulatory':
            factors = riskResult.regulatoryFactors;
            infoMessages = riskResult.regulatoryWarnings;
            break;
          case 'ethical':
            factors = riskResult.ethicalFactors;
            infoMessages = riskResult.ethicalInfo;
            break;
          case 'operational':
            factors = riskResult.operationalFactors;
            infoMessages = riskResult.operationalInfo;
            break;
          case 'business':
            factors = riskResult.reputationalFactors;
            break;
        }

        const title = `${data.month} Risk - Score ${data.desktop.toFixed(1)}`;
        const description = [
          ...factors,
          ...infoMessages
        ].join('. ');

        risksToCreate.push({
          useCaseId: params.useCaseId,
          category,
          riskLevel,
          riskScore: data.desktop,
          title,
          description: description || `${data.month} risk identified from assessment`,
          impact: riskLevel === 'Critical' ? 'High business impact' :
                  riskLevel === 'High' ? 'Moderate business impact' : 'Low business impact',
          likelihood: data.desktop >= 7 ? 'High' : 
                     data.desktop >= 5 ? 'Medium' : 'Low',
          // status omitted to use default OPEN from schema
          createdBy: userRecord.id,
          createdByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown User',
          createdByEmail: userRecord.email,
        });
      }
    }

    // Create all risks in a transaction
    const risks = await prismaClient.$transaction(
      risksToCreate.map(risk => prismaClient.risk.create({ data: risk }))
    );
    console.log('[CRUD_LOG] Risks auto-created:', { count: risks.length, useCaseId: params.useCaseId, riskIds: risks.map(r => r.id), authoredBy: userRecord.id });

    return NextResponse.json(risks);
  } catch (error) {
    console.error('Error auto-creating risks:', error);
    return NextResponse.json(
      { error: 'Failed to auto-create risks' },
      { status: 500 }
    );
  }
}, { requireUser: true });