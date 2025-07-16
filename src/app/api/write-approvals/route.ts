import { prismaClient } from '@/utils/db';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });
    
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { useCaseId, ...rest } = body;
    
    if (!useCaseId) {
      return NextResponse.json({ error: 'Missing useCaseId' }, { status: 400 });
    }

    // Check permissions based on role
    if (userRecord.role !== 'QZEN_ADMIN') {
      const useCase = await prismaClient.useCase.findUnique({
        where: { id: useCaseId },
      });
      
      if (!useCase) {
        return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
      }
      
      if (userRecord.role === 'USER') {
        // USER can only write to their own use cases
        if (useCase.userId !== userRecord.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        // ORG_ADMIN and ORG_USER can only write to use cases in their organization
        if (useCase.organizationId !== userRecord.organizationId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    const res = await prismaClient.approval.upsert({
      where: { useCaseId },
      update: rest,
      create: { useCaseId, ...rest },
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error('Error writing approvals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 