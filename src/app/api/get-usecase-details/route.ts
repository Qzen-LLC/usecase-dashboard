import { prismaClient } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const useCaseId = searchParams.get('useCaseId');
  
  if (!useCaseId) {
    return NextResponse.json({ error: 'Missing useCaseId' }, { status: 400 });
  }

  try {
    // Fetch use case with assessment data only
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      include: {
        assessData: true,
      },
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    return NextResponse.json(useCase);
  } catch (error) {
    console.error('Error fetching use case details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use case details' },
      { status: 500 }
    );
  }
} 