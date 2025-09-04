import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { assessmentId } = await params;
    const { controlId, subcontrolId, status, notes, evidenceFiles } = await request.json();

    // Get the assessment to check ownership
    const assessment = await prismaClient.euAiActAssessment.findUnique({
      where: { id: assessmentId },
      include: { useCase: true }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check permissions based on role
    if (userRecord.role !== 'QZEN_ADMIN') {
      if (userRecord.role === 'USER') {
        // USER can only update their own assessments
        if (assessment.useCase.userId !== userRecord.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        // ORG_ADMIN and ORG_USER can only update assessments in their organization
        if (assessment.useCase.organizationId !== userRecord.organizationId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // Check if framework tables exist
    try {
      await prismaClient.euAiActSubcontrol.findFirst();
    } catch (error) {
      return NextResponse.json(
        { error: 'EU AI ACT framework tables not set up' },
        { status: 404 }
      );
    }

    // Find the control instance first
    const controlInstance = await prismaClient.euAiActControl.findUnique({
      where: {
        controlId_assessmentId: {
          controlId,
          assessmentId
        }
      }
    });

    if (!controlInstance) {
      return NextResponse.json(
        { error: 'Control instance not found' },
        { status: 404 }
      );
    }

    // Upsert the subcontrol instance
    const subcontrol = await prismaClient.euAiActSubcontrol.upsert({
      where: {
        subcontrolId_controlId: {
          subcontrolId,
          controlId: controlInstance.id
        }
      },
      update: {
        status,
        notes,
        evidenceFiles,
        updatedAt: new Date()
      },
      create: {
        subcontrolId,
        controlId: controlInstance.id,
        status,
        notes,
        evidenceFiles
      },
      include: {
        subcontrolStruct: true
      }
    });
    console.log('[CRUD_LOG] EU AI Act Subcontrol upserted:', { id: subcontrol.id, subcontrolId, controlId, status: subcontrol.status, authoredBy: userRecord.id });

    return NextResponse.json(subcontrol);
  } catch (error) {
    console.error('Error saving EU AI ACT subcontrol:', error);
    return NextResponse.json(
      { error: 'Failed to save subcontrol' },
      { status: 500 }
    );
  }
}