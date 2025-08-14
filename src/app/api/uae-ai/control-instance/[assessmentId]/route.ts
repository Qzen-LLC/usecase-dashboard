import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';
import { calculateMaturityScore } from '@/lib/framework-data/uae-ai-scoring';

export async function POST(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId } = await params;
    const body = await request.json();
    const { controlId, implementation, evidenceFiles, score, notes } = body;

    // Verify assessment exists and user has access
    const assessment = await prismaClient.uaeAiAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        useCase: true
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check user permission
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasPermission = userRecord.role === 'QZEN_ADMIN' || 
                         (userRecord.role === 'ORG_ADMIN' && assessment.useCase.organizationId === userRecord.organizationId) ||
                         (userRecord.role === 'ORG_USER' && assessment.useCase.organizationId === userRecord.organizationId) ||
                         assessment.useCase.userId === userRecord.id;

    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create or update control instance
    const controlInstance = await prismaClient.uaeAiControlInstance.upsert({
      where: {
        assessmentId_controlId: {
          assessmentId,
          controlId
        }
      },
      update: {
        implementation,
        evidenceFiles,
        score: score || 0,
        notes,
        status: implementation?.trim() ? 'implemented' : 'pending'
      },
      create: {
        assessmentId,
        controlId,
        implementation: implementation || '',
        evidenceFiles: evidenceFiles || [],
        score: score || 0,
        notes: notes || '',
        status: implementation?.trim() ? 'implemented' : 'pending'
      },
      include: {
        control: true
      }
    });

    // Recalculate overall assessment scores
    await updateAssessmentScores(assessmentId);

    return NextResponse.json(controlInstance);
  } catch (error) {
    console.error('Error saving UAE AI control instance:', error);
    return NextResponse.json(
      { error: 'Failed to save control instance' },
      { status: 500 }
    );
  }
}

async function updateAssessmentScores(assessmentId: string) {
  try {
    // Get all control instances for this assessment
    const controlInstances = await prismaClient.uaeAiControlInstance.findMany({
      where: { assessmentId },
      include: { control: true }
    });

    // Get the assessment to check risk impact level
    const assessment = await prismaClient.uaeAiAssessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) return;

    // Calculate progress (percentage of controls with implementation)
    const implementedControls = controlInstances.filter(ci => ci.implementation?.trim()).length;
    const totalControls = 14; // Total UAE AI controls
    const progress = totalControls > 0 ? (implementedControls / totalControls) * 100 : 0;

    // Calculate maturity score
    const controlScores = controlInstances.map(ci => ({
      controlId: ci.controlId,
      score: ci.score
    }));

    const maturityData = calculateMaturityScore(
      controlScores,
      assessment.riskImpactLevel as 'low' | 'significant' | 'critical'
    );

    // Update assessment with calculated scores
    await prismaClient.uaeAiAssessment.update({
      where: { id: assessmentId },
      data: {
        progress,
        totalScore: maturityData.totalScore,
        weightedScore: maturityData.weightedScore,
        maturityLevel: maturityData.maturityLevel,
        status: progress === 100 ? 'completed' : 'in_progress'
      }
    });
  } catch (error) {
    console.error('Error updating assessment scores:', error);
  }
}