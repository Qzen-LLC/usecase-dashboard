'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import SidebarLayout with SSR disabled to prevent hydration mismatches
const SidebarLayout = dynamic(() => import('@/components/ui/sidebar-layout'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
});

// Routes that should NOT have the sidebar
const NO_SIDEBAR_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/user-profile'
];

// Routes that should have the sidebar (authenticated routes)
const SIDEBAR_ROUTES = [
  '/dashboard',
  '/new-usecase',
  '/edit-usecase',
  '/view-usecase',
  '/admin',
  '/dev',
  '/invite'
];

function ConditionalSidebarLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  // Don't show sidebar for unauthenticated users
  if (!isLoaded || !isSignedIn) {
    return <>{children}</>;
  }

  // Don't show sidebar for specific routes
  if (NO_SIDEBAR_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Show sidebar for authenticated routes
  if (SIDEBAR_ROUTES.some(route => pathname.startsWith(route))) {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  // Default: don't show sidebar for unknown routes
  return <>{children}</>;
}

export default function ConditionalSidebarLayout({ children }: { children: React.ReactNode }) {
  return <ConditionalSidebarLayoutContent>{children}</ConditionalSidebarLayoutContent>;
} 