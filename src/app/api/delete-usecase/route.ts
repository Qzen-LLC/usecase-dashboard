import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

const prismaClient = new PrismaClient();

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { useCaseId } = await request.json();

    if (!useCaseId) {
      return NextResponse.json({ error: 'Use case ID is required' }, { status: 400 });
    }

    // Get the use case to check permissions
    const useCase = await prismaClient.useCase.findUnique({
      where: { id: useCaseId },
      include: { organization: true, user: true }
    });

    if (!useCase) {
      return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
    }

    // Check permissions based on role
    if (userRecord.role === 'QZEN_ADMIN') {
      // QZen admin can delete any use case
    } else if (userRecord.role === 'ORG_ADMIN' || userRecord.role === 'ORG_USER') {
      // Org admin and org user can delete use cases in their organization
      if (useCase.organizationId !== userRecord.organizationId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else {
      // Regular users can only delete their own use cases
      if (useCase.userId !== userRecord.id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Delete the use case
    await prismaClient.useCase.delete({
      where: {
        id: useCaseId,
      },
    });

    // Invalidate Redis cache for /read-usecases for all org users (or just the user if not in org)
    try {
      const redis = (await import('@/lib/redis')).default;
      if (userRecord.organizationId) {
        const orgUsers = await prismaClient.user.findMany({
          where: { organizationId: userRecord.organizationId },
          select: { id: true, role: true }
        });
        console.log(`Invalidating cache for ${orgUsers.length} organization users`);
        for (const u of orgUsers) {
          const orgCacheKey = `usecases:${u.role}:${u.id}`;
          await redis.del(orgCacheKey);
          console.log(`Invalidated cache key: ${orgCacheKey}`);
        }
      } else {
        const cacheKey = `usecases:${userRecord.role}:${userRecord.id}`;
        await redis.del(cacheKey);
        console.log(`Invalidated cache key: ${cacheKey}`);
      }
    } catch (error) {
      console.warn('Redis cache invalidation failed, continuing without cache:', error.message);
    }

    return NextResponse.json({ message: 'Use case deleted successfully' });
  } catch (error) {
    console.error('Error deleting use case:', error);
    return NextResponse.json({ error: 'Failed to delete use case' }, { status: 500 });
  }
} 