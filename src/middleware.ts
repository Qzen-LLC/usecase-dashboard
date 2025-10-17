import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes immediately without touching auth
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For API routes, allow them to handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Only fetch auth for protected, non-API routes
  const authObject = await auth();
  const userId = authObject.userId;

  // Check if user is authenticated
  if (!userId) {
    // Redirect unauthenticated users to sign-in page
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/webpack-hmr|_next/data|_next|.*\\..*|favicon.ico).*)',
  ],
};