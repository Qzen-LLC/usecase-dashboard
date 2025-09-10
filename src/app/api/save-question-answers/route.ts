import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { useCaseId, answers } = await request.json();

    if (!useCaseId || !answers) {
      return NextResponse.json(
        { error: 'useCaseId and answers are required' },
        { status: 400 }
      );
    }

    // Delete existing answers for this use case
    await prisma.answer.deleteMany({
      where: {
        useCaseId: useCaseId
      }
    });

    // Create new answers
    const answerPromises = Object.entries(answers).map(([questionId, answerList]) => {
      return prisma.answer.createMany({
        data: answerList.map((answer: any) => ({
          questionId: questionId,
          useCaseId: useCaseId,
          value: answer.value, // Store the answer value as JSON
        }))
      });
    });

    await Promise.all(answerPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving question answers:', error);
    return NextResponse.json(
      { error: 'Failed to save question answers' },
      { status: 500 }
    );
  }
} 