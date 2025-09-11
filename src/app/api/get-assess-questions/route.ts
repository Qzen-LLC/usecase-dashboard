import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'useCaseId is required' },
        { status: 400 }
      );
    }

    // Get the organization ID from the use case
    const useCase = await prisma.useCase.findUnique({
      where: { id: useCaseId },
      select: { organizationId: true }
    });

    if (!useCase) {
      return NextResponse.json(
        { error: 'Use case not found' },
        { status: 404 }
      );
    }

    // Fetch questions with options and answers
    const questions = await prisma.question.findMany({
      include: {
        options: true,
        answers: {
          where: { useCaseId },  // filter to the current useCase
        },
      },
    });

    // Transform the data to match the expected format
    const formattedQuestions = questions.map(q => {
      // Get the answer data for this question
      const answerData = q.answers.length > 0 ? q.answers[0].value : null;
      
      let answers = [];
      if (answerData) {
        if (answerData.optionIds && answerData.labels) {
          // For CHECKBOX and RADIO questions
          answers = answerData.optionIds.map((optionId: string, index: number) => ({
            id: `${q.id}-${optionId}`,
            value: answerData.labels[index],
            questionId: q.id,
            optionId: optionId,
          }));
        } else if (answerData.text) {
          // For TEXT and SLIDER questions
          answers = [{
            id: `${q.id}-${q.type.toLowerCase()}`,
            value: answerData.text,
            questionId: q.id,
          }];
        }
      }

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options.map(o => ({
          id: o.id,
          text: o.text,
          questionId: q.id,
        })),
        answers: answers,
      };
    });

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}