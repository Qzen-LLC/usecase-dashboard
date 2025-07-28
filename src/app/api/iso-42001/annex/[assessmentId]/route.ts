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
    const { itemId, implementation, evidenceFiles } = await request.json();
    
    console.log('🔄 ISO 42001 Annex API - Received data:', {
      assessmentId,
      itemId,
      implementation: implementation?.substring(0, 50) + '...',
      evidenceFilesCount: evidenceFiles?.length || 0,
      evidenceFiles
    });

    // Get the assessment to check ownership
    const assessment = await prismaClient.iso42001Assessment.findUnique({
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

    // First find the item by its itemId to get the UUID
    const annexItem = await prismaClient.iso42001AnnexItem.findUnique({
      where: { itemId }
    });

    if (!annexItem) {
      return NextResponse.json({ error: `Annex item ${itemId} not found` }, { status: 404 });
    }

    console.log('🔄 Found annex item:', { itemId, annexItemUuid: annexItem.id });

    // Upsert the annex instance (create if doesn't exist, update if it does)
    console.log('🔄 About to upsert annex instance with:', {
      where: { assessmentId_itemId: { assessmentId, itemId: annexItem.id } },
      evidenceFilesType: typeof evidenceFiles,
      evidenceFiles
    });
    
    const updatedInstance = await prismaClient.iso42001AnnexInstance.upsert({
      where: {
        assessmentId_itemId: {
          assessmentId,
          itemId: annexItem.id
        }
      },
      update: {
        implementation,
        evidenceFiles,
        status: implementation.trim() ? 'implemented' : 'pending',
        updatedAt: new Date()
      },
      create: {
        itemId: annexItem.id,
        assessmentId,
        implementation,
        evidenceFiles,
        status: implementation.trim() ? 'implemented' : 'pending'
      },
      include: {
        item: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('Error saving ISO 42001 annex:', error);
    return NextResponse.json(
      { error: 'Failed to save implementation' },
      { status: 500 }
    );
  }
}