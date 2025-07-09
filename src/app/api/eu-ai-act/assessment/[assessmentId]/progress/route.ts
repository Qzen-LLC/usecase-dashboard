import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;
    const { progress } = await request.json();

    const updatedAssessment = await prismaClient.euAiActAssessment.update({
      where: { id: assessmentId },
      data: {
        progress,
        status: progress >= 100 ? 'completed' : 'in_progress',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error('Error updating EU AI ACT assessment progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}