'use client';

import { usePathname } from 'next/navigation';
import SidebarLayout from '@/components/ui/sidebar-layout';

export default function ConditionalSidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOrRootPage = pathname === '/' || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  return isAuthOrRootPage ? <>{children}</> : <SidebarLayout>{children}</SidebarLayout>;
} 