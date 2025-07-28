import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const userId = (auth as any).userId;
  const { pathname } = req.nextUrl;
  
  console.log("[Middleware] userId:", userId, "pathname:", pathname);

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For API routes, allow them to handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For all other routes, allow access (temporary bypass)
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};