import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/utils/db';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const useCaseId = searchParams.get('useCaseId');
    const scope = searchParams.get('scope');

    if (!useCaseId || !scope) {
      return NextResponse.json({ 
        error: 'Missing required parameters: useCaseId and scope' 
      }, { status: 400 });
    }

    // Validate scope
    const validScopes = ['ASSESS', 'EDIT', 'GOVERNANCE_EU_AI_ACT', 'GOVERNANCE_ISO_42001', 'GOVERNANCE_UAE_AI'];
    if (!validScopes.includes(scope)) {
      return NextResponse.json({ 
        error: 'Invalid scope. Must be one of: ASSESS, EDIT, GOVERNANCE_EU_AI_ACT, GOVERNANCE_ISO_42001, GOVERNANCE_UAE_AI' 
      }, { status: 400 });
    }

    // Check if use case exists and user has access
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    // Check permissions based on role
    if (userRecord.role !== 'QZEN_ADMIN') {
      if (userRecord.role === 'USER') {
        if (useCase.userId !== userRecord.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        if (useCase.organizationId !== userRecord.organizationId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // Clean up expired locks first
    await prismaClient.lock.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true
      },
      data: { isActive: false }
    });

    // Check for existing locks on this specific scope
    const existingLocks = await prismaClient.lock.findMany({
      where: {
        useCaseId,
        scope,
        isActive: true
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    const exclusiveLocks = existingLocks.filter(lock => lock.type === 'EXCLUSIVE');
    const sharedLocks = existingLocks.filter(lock => lock.type === 'SHARED');

    let lockInfo = null;

    if (exclusiveLocks.length > 0) {
      // There's an exclusive lock
      const exclusiveLock = exclusiveLocks[0];
      const heldByCurrentUser = exclusiveLock.userId === userRecord.id;
      
      lockInfo = {
        hasLock: true,
        canEdit: heldByCurrentUser,
        lockDetails: {
          scope: exclusiveLock.scope as any,
          acquiredBy: `${exclusiveLock.User.firstName} ${exclusiveLock.User.lastName}`,
          acquiredAt: exclusiveLock.acquiredAt.toISOString(),
          expiresAt: exclusiveLock.expiresAt.toISOString(),
          isOwnedByCurrentUser: heldByCurrentUser
        }
      };
    } else if (sharedLocks.length > 0) {
      // There are shared locks but no exclusive lock
      const currentUserSharedLock = sharedLocks.find(lock => lock.userId === userRecord.id);
      
      lockInfo = {
        hasLock: !!currentUserSharedLock,
        canEdit: true, // Shared locks allow editing
        lockDetails: currentUserSharedLock ? {
          scope: currentUserSharedLock.scope as any,
          acquiredBy: 'You',
          acquiredAt: currentUserSharedLock.acquiredAt.toISOString(),
          expiresAt: currentUserSharedLock.expiresAt.toISOString(),
          isOwnedByCurrentUser: true
        } : undefined
      };
    } else {
      // No locks exist
      lockInfo = {
        hasLock: false,
        canEdit: true
      };
    }

    return NextResponse.json({ lockInfo });
  } catch (error) {
    console.error('Error checking lock status:', error);
    return NextResponse.json(
      { error: 'Failed to check lock status' },
      { status: 500 }
    );
  }
}

