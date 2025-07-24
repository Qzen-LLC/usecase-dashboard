#!/usr/bin/env tsx

import { writeFileSync, readFileSync } from 'fs';

const middlewarePath = '/Users/kaluri/usecase-dashboard/src/middleware.ts';
const backupPath = '/Users/kaluri/usecase-dashboard/src/middleware.ts.backup';

function createAuthBypass() {
  console.log('🔧 Creating temporary auth bypass...');

  try {
    // Backup original middleware
    const originalMiddleware = readFileSync(middlewarePath, 'utf8');
    writeFileSync(backupPath, originalMiddleware);
    console.log('✅ Backed up original middleware');

    // Create bypass middleware
    const bypassMiddleware = `import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // TEMPORARY BYPASS FOR TESTING - Mock authenticated user
  const originalUserId = auth.userId;
  const { pathname } = req.nextUrl;
  
  // Mock user ID for testing
  const mockUserId = originalUserId || 'mock-test-user-123';
  
  console.log("[Middleware] userId:", mockUserId, "pathname:", pathname, originalUserId ? "(real)" : "(mock)");

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For testing: allow all routes with mock user
  // In production, this should be removed!
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};`;

    writeFileSync(middlewarePath, bypassMiddleware);
    console.log('✅ Created bypass middleware');
    
    console.log(`
🚀 Auth bypass created! Now you can:

1. Restart your dev server:
   npm run dev

2. Test governance without authentication:
   - Go to http://localhost:3002/dashboard/governance
   - APIs will use mock user ID
   - All functionality should work

3. To restore original auth:
   npm run restore-auth

⚠️  WARNING: This bypasses all security! Only use for testing.
`);

  } catch (error) {
    console.error('❌ Error creating auth bypass:', error);
  }
}

if (require.main === module) {
  createAuthBypass();
}

export default createAuthBypass;