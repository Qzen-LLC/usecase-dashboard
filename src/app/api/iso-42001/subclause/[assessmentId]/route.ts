import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;
    const { subclauseId, implementation, evidenceFiles } = await request.json();

    // Update the subclause instance
    const updatedInstance = await prismaClient.iso42001SubclauseInstance.update({
      where: {
        subclauseId_assessmentId: {
          subclauseId,
          assessmentId
        }
      },
      data: {
        implementation,
        evidenceFiles,
        status: implementation.trim() ? 'implemented' : 'pending',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedInstance);
  } catch (error) {
    console.error('Error saving ISO 42001 subclause:', error);
    return NextResponse.json(
      { error: 'Failed to save implementation' },
      { status: 500 }
    );
  }
}