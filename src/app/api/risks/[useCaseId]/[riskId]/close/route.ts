import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';

// POST /api/risks/[useCaseId]/[riskId]/close - Close a risk
export async function POST(
  request: Request,
  { params }: { params: { useCaseId: string; riskId: string } }
) {
  try {
    // TEMPORARY: Auth bypass for testing
    const user = await currentUser();
    let userRecord;
    
    if (!user) {
      // Use bypass user for testing
      console.log('[API] Using bypass user for testing');
      userRecord = await prismaClient.user.findFirst({
        where: { role: 'QZEN_ADMIN' }
      });
      if (!userRecord) {
        return NextResponse.json({ error: 'No admin user found for bypass' }, { status: 500 });
      }
    } else {
      userRecord = await prismaClient.user.findUnique({
        where: { clerkId: user.id },
      });
      if (!userRecord) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    const { closureReason } = await request.json();

    const risk = await prismaClient.risk.update({
      where: { id: params.riskId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userRecord.id,
        closedByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown User',
        closedByEmail: userRecord.email,
        closureReason,
        updatedBy: userRecord.id,
        updatedByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown User',
        updatedByEmail: userRecord.email,
      }
    });
    console.log('[CRUD_LOG] Risk closed:', { id: params.riskId, useCaseId: params.useCaseId, closedAt: risk.closedAt, updatedAt: risk.updatedAt });

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Error closing risk:', error);
    return NextResponse.json(
      { error: 'Failed to close risk' },
      { status: 500 }
    );
  }
}