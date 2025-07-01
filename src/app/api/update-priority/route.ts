import { NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';

const VALID_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export async function POST(request: Request) {
  try {
    const { useCaseId, priority } = await request.json();

    if (!useCaseId || !priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate priority value
    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 });
    }

    const updatedUseCase = await prismaClient.useCase.update({
      where: { id: useCaseId },
      data: { 
        priority: priority,
        updatedAt: new Date() 
      },
    });

    return NextResponse.json(updatedUseCase);
  } catch (error) {
    console.error('Error updating priority:', error);
    return NextResponse.json({ error: 'Failed to update priority' }, { status: 500 });
  }
} 