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

    const { useCaseId, lockType } = await request.json();

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

    // Clean up expired locks
    await prismaClient.lock.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true
      },
      data: { isActive: false }
    });

    // Check for existing locks
    const existingLocks = await prismaClient.lock.findMany({
      where: {
        useCaseId,
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

    // Handle exclusive lock acquisition
    if (lockType === 'EXCLUSIVE') {
      console.log(`[LOCK ACQUIRE] Attempting to acquire EXCLUSIVE lock for useCaseId: ${useCaseId}, userId: ${userRecord.id}`);
      console.log(`[LOCK ACQUIRE] Existing exclusive locks: ${exclusiveLocks.length}, shared locks: ${sharedLocks.length}`);
      
      if (exclusiveLocks.length > 0) {
        const lock = exclusiveLocks[0];
        console.log(`[LOCK ACQUIRE] Exclusive lock already exists, held by: ${lock.User.firstName} ${lock.User.lastName}`);
        return NextResponse.json({
          error: 'Exclusive lock already exists',
          lockDetails: {
            type: lock.type,
            acquiredBy: `${lock.User.firstName} ${lock.User.lastName}`,
            acquiredAt: lock.acquiredAt,
            expiresAt: lock.expiresAt
          }
        }, { status: 409 });
      }

      // If there are shared locks, we can still acquire exclusive lock
      // but we'll notify shared lock holders
      try {
        console.log(`[LOCK ACQUIRE] Creating new EXCLUSIVE lock for useCaseId: ${useCaseId}, userId: ${userRecord.id}`);
        
        const lock = await prismaClient.lock.create({
          data: {
            useCaseId,
            userId: userRecord.id,
            type: 'EXCLUSIVE',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            isActive: true
          }
        });

        console.log(`[LOCK ACQUIRE] Successfully created EXCLUSIVE lock with ID: ${lock.id}, isActive: ${lock.isActive}`);

        return NextResponse.json({
          success: true,
          lock,
          message: sharedLocks.length > 0 
            ? `Exclusive lock acquired. ${sharedLocks.length} shared lock(s) will be notified.`
            : 'Exclusive lock acquired successfully'
        });
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('useCaseId')) {
          console.log(`[LOCK ACQUIRE] Unique constraint violation, attempting to reactivate existing lock`);
          
          // Lock already exists, try to reactivate it
          const existingLock = await prismaClient.lock.findFirst({
            where: {
              useCaseId,
              userId: userRecord.id,
              type: 'EXCLUSIVE'
            }
          });

          if (existingLock) {
            console.log(`[LOCK ACQUIRE] Found existing lock with ID: ${existingLock.id}, reactivating...`);
            
            const updatedLock = await prismaClient.lock.update({
              where: { id: existingLock.id },
              data: {
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                isActive: true
              }
            });

            console.log(`[LOCK ACQUIRE] Successfully reactivated lock with ID: ${updatedLock.id}, isActive: ${updatedLock.isActive}`);

            return NextResponse.json({
              success: true,
              lock: updatedLock,
              message: 'Exclusive lock reactivated successfully'
            });
          }
        }
        
        // Re-throw other errors
        throw error;
      }
    }

    // Handle shared lock acquisition
    if (lockType === 'SHARED') {
      if (exclusiveLocks.length > 0) {
        const lock = exclusiveLocks[0];
        return NextResponse.json({
          error: 'Cannot acquire shared lock while exclusive lock exists',
          lockDetails: {
            type: lock.type,
            acquiredBy: `${lock.User.firstName} ${lock.User.lastName}`,
            acquiredAt: lock.acquiredAt,
            expiresAt: lock.expiresAt
          }
        }, { status: 409 });
      }

      // Check if user already has a shared lock
      const existingUserLock = existingLocks.find(lock => 
        lock.userId === userRecord.id && lock.type === 'SHARED'
      );

      if (existingUserLock) {
        // Extend existing lock
        const updatedLock = await prismaClient.lock.update({
          where: { id: existingUserLock.id },
          data: {
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            isActive: true
          }
        });

        return NextResponse.json({
          success: true,
          lock: updatedLock,
          message: 'Shared lock extended successfully'
        });
      }

      // Create new shared lock
      try {
        const lock = await prismaClient.lock.create({
          data: {
            useCaseId,
            userId: userRecord.id,
            type: 'SHARED',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            isActive: true
          }
        });

        return NextResponse.json({
          success: true,
          lock,
          message: 'Shared lock acquired successfully'
        });
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('useCaseId')) {
          // Lock already exists, try to reactivate it
          const existingLock = await prismaClient.lock.findFirst({
            where: {
              useCaseId,
              userId: userRecord.id,
              type: 'SHARED'
            }
          });

          if (existingLock) {
            const updatedLock = await prismaClient.lock.update({
              where: { id: existingLock.id },
              data: {
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                isActive: true
              }
            });

            return NextResponse.json({
              success: true,
              lock: updatedLock,
              message: 'Shared lock reactivated successfully'
            });
          }
        }
        
        // Re-throw other errors
        throw error;
      }
    }

    return NextResponse.json({ error: 'Invalid lock type' }, { status: 400 });

  } catch (error) {
    console.error('Error acquiring lock:', error);
    return NextResponse.json(
      { error: 'Failed to acquire lock' },
      { status: 500 }
    );
  }
}
