import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
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
};