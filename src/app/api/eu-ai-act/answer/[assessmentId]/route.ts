import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;
    const { questionId, answer, evidenceFiles } = await request.json();

    // Upsert the answer
    const savedAnswer = await prismaClient.euAiActAnswer.upsert({
      where: {
        questionId_assessmentId: {
          questionId,
          assessmentId
        }
      },
      update: {
        answer,
        evidenceFiles,
        status: answer.trim() ? 'completed' : 'pending',
        updatedAt: new Date()
      },
      create: {
        questionId,
        assessmentId,
        answer,
        evidenceFiles,
        status: answer.trim() ? 'completed' : 'pending'
      }
    });

    return NextResponse.json(savedAnswer);
  } catch (error) {
    console.error('Error saving EU AI ACT answer:', error);
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    );
  }
}