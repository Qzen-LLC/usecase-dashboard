import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';

// PUT /api/risks/[useCaseId]/[riskId] - Update a risk
export async function PUT(
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

    const data = await request.json();

    const updateData: any = {
      updatedBy: userRecord.id,
      updatedByName: `${userRecord.firstName || ''} ${userRecord.lastName || ''}`.trim() || 'Unknown User',
      updatedByEmail: userRecord.email,
    };

    // Add fields that can be updated
    if (data.status !== undefined) updateData.status = data.status;
    if (data.mitigationPlan !== undefined) updateData.mitigationPlan = data.mitigationPlan;
    if (data.mitigationStatus !== undefined) updateData.mitigationStatus = data.mitigationStatus;
    if (data.assignedToName !== undefined) updateData.assignedToName = data.assignedToName;
    if (data.assignedToEmail !== undefined) updateData.assignedToEmail = data.assignedToEmail;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    if (data.actualDate !== undefined) updateData.actualDate = data.actualDate ? new Date(data.actualDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const risk = await prismaClient.risk.update({
      where: { id: params.riskId },
      data: updateData
    });
    console.log('[CRUD_LOG] Risk updated:', { id: params.riskId, useCaseId: params.useCaseId, status: data.status, updatedAt: risk.updatedAt, authoredBy: userRecord.id });

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Error updating risk:', error);
    return NextResponse.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    );
  }
}

// DELETE /api/risks/[useCaseId]/[riskId] - Delete a risk
export async function DELETE(
  request: Request,
  { params }: { params: { useCaseId: string; riskId: string } }
) {
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

    await prismaClient.risk.delete({
      where: { id: params.riskId }
    });
    console.log('[CRUD_LOG] Risk deleted:', { id: params.riskId, useCaseId: params.useCaseId, authoredBy: userRecord.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting risk:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    );
  }
}