import { NextResponse } from 'next/server';


// In-memory cache for development
const userCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5; // 5 seconds for faster role updates

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

// This route is deprecated: user data is now sourced from Clerk JWT claims.
export async function GET() {
  return NextResponse.json({
    deprecated: true,
    message: 'Use Clerk session claims via auth() on the server or useAuth()/useUser() on the client.'
  }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({
    deprecated: true,
    message: 'No cache. User info comes from Clerk claims.'
  }, { status: 410 });
}