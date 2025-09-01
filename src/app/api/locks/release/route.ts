import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
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

    let useCaseId: string;
    let lockType: string;

    // Handle both JSON and FormData (for beacon requests)
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      useCaseId = body.useCaseId;
      lockType = body.lockType;
    } else {
      // Handle FormData from beacon
      const formData = await request.formData();
      useCaseId = formData.get('useCaseId') as string;
      lockType = formData.get('lockType') as string;
    }

    if (!useCaseId || !lockType) {
      return NextResponse.json({ 
        error: 'Missing required fields: useCaseId and lockType' 
      }, { status: 400 });
    }

    if (!['SHARED', 'EXCLUSIVE'].includes(lockType)) {
      return NextResponse.json({ 
        error: 'Invalid lock type. Must be SHARED or EXCLUSIVE' 
      }, { status: 400 });
    }

    // Find any active lock of the specified type for this use case (not just the current user's lock)
    const lock = await prismaClient.lock.findFirst({
      where: {
        useCaseId,
        type: lockType,
        isActive: true
      }
    });

    console.log(`[LOCK RELEASE] Found lock:`, lock ? {
      id: lock.id,
      userId: lock.userId,
      isActive: lock.isActive
    } : 'No active lock found');

    if (!lock) {
      // No active lock found - this is fine, just return success
      console.log(`[LOCK RELEASE] No active ${lockType} lock found to release`);
      return NextResponse.json({
        success: true,
        message: `No active ${lockType} lock found to release`,
        alreadyReleased: true
      });
    }

    // Release the active lock
    await prismaClient.lock.update({
      where: { id: lock.id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: `${lockType} lock released successfully`,
      alreadyReleased: false
    });

  } catch (error) {
    console.error('Error releasing lock:', error);
    return NextResponse.json(
      { error: 'Failed to release lock' },
      { status: 500 }
    );
  }
}
