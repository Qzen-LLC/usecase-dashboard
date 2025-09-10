import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');
    const orgId = searchParams.get('orgId'); // You might need to get this from user context

    if (!useCaseId) {
      return NextResponse.json(
        { error: 'useCaseId is required' },
        { status: 400 }
      );
    }

    // Fetch questions with their options and answers filtered by useCaseId
    const questions = await prisma.question.findMany({
      where: { 
        // Add organization filter if needed
        // organisationId: orgId 
      },
      include: {
        options: true,
        answers: {
          where: { useCaseId },  // filter to the current useCase
        },
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}