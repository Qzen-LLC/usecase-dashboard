import { prismaClient } from '@/utils/db';
import { withAuth } from '@/lib/auth-gateway';
import { buildStepsDataFromAnswers } from '@/lib/mappers/answers-to-steps';


export const GET = withAuth(async (req: Request, { auth }) => {
  try {
    // auth context is provided by withAuth wrapper
    
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    
    if (!userRecord) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get('useCaseId');
    const acquireSharedLock = searchParams.get('acquireSharedLock') === 'true';
    
    if (!useCaseId) {
      return new Response(JSON.stringify({ error: 'Missing useCaseId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check permissions based on role
    if (userRecord.role !== 'QZEN_ADMIN') {
      const useCase = await prismaClient.useCase.findUnique({
        where: { id: useCaseId },
      });
      
      if (!useCase) {
        return new Response(JSON.stringify({ error: 'Use case not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      if (userRecord.role === 'USER') {
        // USER can only access their own use cases
        if (useCase.userId !== userRecord.id) {
          return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
      } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
        // ORG_ADMIN and ORG_USER can only access use cases in their organization
        if (useCase.organizationId !== userRecord.organizationId) {
          return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
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
        organizationId: true,
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
        answers: {
          include: {
            question: true,
            questionTemplate: true,
          }
        },
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
      return new Response(JSON.stringify({ error: 'Use case not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
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
      const scopeParam = searchParams.get('scope');
      const allowedScopes = [
        'ASSESS',
        'EDIT',
        'GOVERNANCE_EU_AI_ACT',
        'GOVERNANCE_ISO_42001',
        'GOVERNANCE_UAE_AI',
        'GOVERNANCE_ISO_27001',
      ];
      const scope = (allowedScopes.includes(scopeParam || '') ? scopeParam : 'ASSESS') as any;

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
        const exclusiveLock = exclusiveLocks[0] as any;
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

    // Build stepsData from answers (replacing assessData)
    const stepsData = await buildStepsDataFromAnswers(useCase.id);
    const assessData = {
      stepsData,
      updatedAt: useCase.updatedAt,
      createdAt: useCase.createdAt,
    };

    const responseData = {
      ...useCase,
      assessData,
      lockInfo
    };

    return new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching use case details:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch use case details' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}, { requireUser: true });