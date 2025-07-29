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
  
  // Get the actual auth object by awaiting it
  const authObject = await auth();
  const userId = authObject.userId;
  
  // Debug logging
  console.log("[Middleware] userId:", userId, "pathname:", pathname);
  
  // Allow public routes
  if (isPublicRoute(req)) {
    console.log("[Middleware] Allowing public route:", pathname);
    return NextResponse.next();
  }

  // For API routes, allow them to handle their own authentication
  if (pathname.startsWith('/api/')) {
    console.log("[Middleware] Allowing API route:", pathname);
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!userId) {
    console.log("[Middleware] No userId, redirecting to sign-in");
    // Redirect unauthenticated users to sign-in page
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  console.log("[Middleware] User authenticated, allowing access to:", pathname);
  // User is authenticated, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};