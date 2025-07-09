import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;
    const { itemId, implementation, evidenceFiles } = await request.json();

    // Update the annex instance
    const updatedInstance = await prismaClient.iso42001AnnexInstance.update({
      where: {
        itemId_assessmentId: {
          itemId,
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
    console.error('Error saving ISO 42001 annex:', error);
    return NextResponse.json(
      { error: 'Failed to save implementation' },
      { status: 500 }
    );
  }
}