import { prismaClient } from '@/utils/db';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get('useCaseId');
    const acquireSharedLock = searchParams.get('acquireSharedLock') === 'true';
    
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
        // USER can only access their own use cases
        if (useCase.userId !== userRecord.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        // ORG_ADMIN and ORG_USER can only access use cases in their organization
        if (useCase.organizationId !== userRecord.organizationId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // Fetch use case with all needed fields
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      select: {
        id: true,
        title: true,
        aiucId: true,
        problemStatement: true,
        proposedAISolution: true,
        primaryStakeholders: true,
        secondaryStakeholders: true,
        successCriteria: true,
        problemValidation: true,
        solutionHypothesis: true,
        keyAssumptions: true,
        initialROI: true,
        confidenceLevel: true,
        operationalImpactScore: true,
        productivityImpactScore: true,
        revenueImpactScore: true,
        implementationComplexity: true,
        estimatedTimeline: true,
        requiredResources: true,
        businessFunction: true,
        stage: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        assessData: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    // Check for locks if acquireSharedLock is requested
    let lockInfo = null;
    if (acquireSharedLock) {
      // Clean up expired locks first
      await prismaClient.lock.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true
        },
        data: { isActive: false }
      });

      // Get the scope from query parameters (default to ASSESS for backward compatibility)
      const scope = searchParams.get('scope') || 'ASSESS';

      // Check for existing locks for the specific scope
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
      
      if (exclusiveLocks.length > 0) {
        // Exclusive lock exists - check if current user owns it
        const exclusiveLock = exclusiveLocks[0];
        const heldByCurrentUser = exclusiveLock.userId === userRecord.id;
        lockInfo = {
          hasExclusiveLock: true,
          canEdit: heldByCurrentUser,
          exclusiveLockDetails: {
            type: exclusiveLock.type,
            acquiredBy: `${exclusiveLock.User.firstName} ${exclusiveLock.User.lastName}`,
            acquiredAt: exclusiveLock.acquiredAt,
            expiresAt: exclusiveLock.expiresAt
          }
        };
      } else {
        // No exclusive lock - anyone can view, and can request to edit
        lockInfo = {
          hasExclusiveLock: false,
          canEdit: true,
          message: 'No exclusive lock - available for editing'
        };
      }
    }

    const responseData = {
      ...useCase,
      lockInfo
    };

    const response = NextResponse.json(responseData);
    // Add caching headers for use case details (cache for 30 seconds)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Error fetching use case details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch use case details' },
      { status: 500 }
    );
  }
} 