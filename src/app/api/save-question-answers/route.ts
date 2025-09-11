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

    console.log('Saving answers:', answers); // Debug log

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

        const firstAnswer = questionAnswers[0];
        
        // Check if this is a text-based question (TEXT or SLIDER) - no optionId
        if (firstAnswer.optionId === undefined) {
          // For TEXT and SLIDER questions, store the value directly
          console.log(`Saving text-based answer for question ${questionId}:`, firstAnswer.value);
          await prisma.answer.create({
            data: {
              questionId: questionId,
              useCaseId: useCaseId,
              value: { text: firstAnswer.value }, // Store as { text: "answer" }
            },
          });
        } else {
          // For CHECKBOX and RADIO questions, extract option IDs and labels
          const optionIds = questionAnswers
            .map((answer: any) => answer.optionId)
            .filter((id: any) => id !== undefined && id !== null);
          
          const labels = questionAnswers
            .map((answer: any) => answer.label || answer.value) // fallback to value if label doesn't exist
            .filter((label: any) => label !== undefined && label !== null);

          // Only create answer if we have valid data
          if (optionIds.length > 0 && labels.length > 0) {
            console.log(`Saving option-based answer for question ${questionId}:`, { optionIds, labels });
            await prisma.answer.create({
              data: {
                questionId: questionId,
                useCaseId: useCaseId,
                value: { optionIds, labels }, // Store as { optionIds: [], labels: [] }
              },
            });
          }
        }
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