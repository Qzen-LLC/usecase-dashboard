import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { JWTPayload } from 'jose';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Get the actual auth object by awaiting it
  const authObject = await auth();
  const userId = authObject.userId;
  const claims = (authObject?.sessionClaims as JWTPayload | undefined) || {};
  const appRole = (claims as any).appRole as string | undefined;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For API routes, allow them to handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!userId) {
    // Redirect unauthenticated users to sign-in page
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Example: gate admin routes by role claim without DB lookup
  if (pathname.startsWith('/admin')) {
    if (appRole !== 'QZEN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // User is authenticated, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|.\\..|favicon.ico).*)',
  ],
};