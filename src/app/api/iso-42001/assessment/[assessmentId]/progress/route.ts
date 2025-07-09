import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;
    const { progress } = await request.json();

    const updatedAssessment = await prismaClient.iso42001Assessment.update({
      where: { id: assessmentId },
      data: {
        progress,
        status: progress >= 100 ? 'completed' : 'in_progress',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error('Error updating ISO 42001 assessment progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}