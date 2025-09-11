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

    // Process each question's answers
    for (const [questionId, questionAnswers] of Object.entries(answers)) {
      if (Array.isArray(questionAnswers) && questionAnswers.length > 0) {
        // Delete existing answer for this question and use case
        await prisma.answer.deleteMany({
          where: {
            questionId: questionId,
            useCaseId: useCaseId,
          },
        });

        // Create a single answer record with all answers as JSON array
        await prisma.answer.create({
          data: {
            questionId: questionId,
            useCaseId: useCaseId,
            value: questionAnswers, // Store as JSON array
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving question answers:', error);
    return NextResponse.json(
      { error: 'Failed to save question answers' },
      { status: 500 }
    );
  }
} 