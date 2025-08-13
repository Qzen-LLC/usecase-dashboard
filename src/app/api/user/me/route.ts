import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';


// In-memory cache for development
const userCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60; // 5 minutes in seconds

// Cache key generator
const getCacheKey = (clerkId: string) => `user:${clerkId}`;

// Get cached data
async function getCachedUser(clerkId: string) {
  try {
    const cached = userCache.get(clerkId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL * 1000) {
      return cached.data;
    }
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

// Set cached data
async function setCachedUser(clerkId: string, data: any) {
  try {
    userCache.set(clerkId, {
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Invalidate cache
async function invalidateUserCache(clerkId: string) {
  try {
    userCache.delete(clerkId);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cached = await getCachedUser(user.id);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch user data with optimized query
    const userRecord = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            domain: true,
          }
        },
      },
    });

    if (!userRecord) {
      return NextResponse.json({ 
        error: 'User not found in database',
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress 
      }, { status: 404 });
    }

    const responseData = {
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        role: userRecord.role,
        organizationId: userRecord.organizationId,
        organization: userRecord.organization,
      },
    };

    // Cache the response
    await setCachedUser(user.id, responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Invalidate cache for this user
    await invalidateUserCache(user.id);

    return NextResponse.json({ success: true, message: 'Cache invalidated' });

  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 