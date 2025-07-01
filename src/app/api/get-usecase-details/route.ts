import { prismaClient } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const useCaseId = searchParams.get('useCaseId');
  
  if (!useCaseId) {
    return NextResponse.json({ error: 'Missing useCaseId' }, { status: 400 });
  }

  try {
    // Fetch use case with all needed fields
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      select: {
        id: true,
        title: true,
        aiucId: true,
        problemStatement: true,
        proposedAISolution: true,
        currentState: true,
        desiredState: true,
        primaryStakeholders: true,
        secondaryStakeholders: true,
        successCriteria: true,
        problemValidation: true,
        solutionHypothesis: true,
        keyAssumptions: true,
        initialROI: true,
        confidenceLevel: true,
        operationalImpactScore: true,
        productivityImpactScore: true,
        revenueImpactScore: true,
        implementationComplexity: true,
        estimatedTimeline: true,
        requiredResources: true,
        businessFunction: true,
        stage: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        assessData: true
      }
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    return NextResponse.json(useCase);
  } catch (error) {
    console.error('Error fetching use case details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use case details' },
      { status: 500 }
    );
  }
} 