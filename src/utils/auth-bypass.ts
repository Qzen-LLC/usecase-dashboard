import { currentUser } from '@clerk/nextjs/server';
import { prismaClient } from '@/utils/db';

/**
 * Auth bypass utility for testing
 * Checks if AUTH_BYPASS env var is set and returns mock user if enabled
 */
export async function getAuthUser() {
  // Check if bypass is enabled
  const bypassEnabled = process.env.AUTH_BYPASS === 'true';
  const bypassUserId = process.env.AUTH_BYPASS_USER_ID || 'mock-test-user-123';

  // Get the actual Clerk user
  const clerkUser = await currentUser();

  // If bypass is enabled and no real user, use mock
  if (bypassEnabled && !clerkUser) {
    console.log('[Auth Bypass] Using mock user:', bypassUserId);
    return {
      id: bypassUserId,
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    };
  }

  // Otherwise return the real user (or null)
  return clerkUser;
}

/**
 * Get user record from database with bypass support
 */
export async function getUserRecord() {
  const user = await getAuthUser();
  
  if (!user) {
    return null;
  }

  const userRecord = await prismaClient.user.findUnique({
    where: { clerkId: user.id },
    include: { organization: true }
  });

  return userRecord;
}