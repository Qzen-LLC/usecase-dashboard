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
      if (Array.isArray(questionAnswers)) {
        // Always delete existing answer first, regardless of whether new answer is empty
        await prisma.answer.deleteMany({
          where: {
            questionId: questionId,
            useCaseId: useCaseId,
          },
        });
        
        // Only create a new answer if there's data to save
        if (questionAnswers.length > 0) {

        const firstAnswer = questionAnswers[0];
        
        // Check if this is a text-based question (TEXT, TEXT_MINI or SLIDER) - no optionId
        if (firstAnswer.optionId === undefined) {
          // For TEXT, TEXT_MINI and SLIDER questions, store the value directly
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
        } else {
          // Log when answer is deleted due to empty selection
          console.log(`Deleted answer for question ${questionId} - no selections made`);
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