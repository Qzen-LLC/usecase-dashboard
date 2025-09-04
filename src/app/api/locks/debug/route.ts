import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get('useCaseId');
    
    if (!useCaseId) {
      return NextResponse.json({ error: 'Missing useCaseId' }, { status: 400 });
    }

    // Get all locks for this use case
    const allLocks = await prismaClient.lock.findMany({
      where: { useCaseId },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            clerkId: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { acquiredAt: 'desc' }
      ]
    });

    // Get the current user's locks specifically
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });

    const userLocks = userRecord ? await prismaClient.lock.findMany({
      where: {
        useCaseId,
        userId: userRecord.id
      }
    }) : [];

    return NextResponse.json({
      useCaseId,
      currentUser: {
        clerkId: user.id,
        userId: userRecord?.id,
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName
      },
      allLocks,
      userLocks,
      summary: {
        totalLocks: allLocks.length,
        activeLocks: allLocks.filter(l => l.isActive).length,
        exclusiveLocks: allLocks.filter(l => l.type === 'EXCLUSIVE' && l.isActive).length,
        sharedLocks: allLocks.filter(l => l.type === 'SHARED' && l.isActive).length,
        expiredLocks: allLocks.filter(l => l.expiresAt < new Date()).length
      }
    });

  } catch (error) {
    console.error('Error in lock debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get lock debug info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { useCaseId, action } = await req.json();
    
    if (!useCaseId || !action) {
      return NextResponse.json({ error: 'Missing useCaseId or action' }, { status: 400 });
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'forceReleaseAll') {
      // Force release all locks for this use case (admin only)
      if (userRecord.role !== 'QZEN_ADMIN') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const result = await prismaClient.lock.updateMany({
        where: { useCaseId },
        data: { isActive: false }
      });

      return NextResponse.json({
        success: true,
        message: `Force released ${result.count} locks`,
        releasedCount: result.count
      });
    }

    if (action === 'forceReleaseUser') {
      // Force release all locks for the current user on this use case
      const result = await prismaClient.lock.updateMany({
        where: {
          useCaseId,
          userId: userRecord.id
        },
        data: { isActive: false }
      });

      return NextResponse.json({
        success: true,
        message: `Force released ${result.count} user locks`,
        releasedCount: result.count
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in lock debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to execute lock debug action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
