'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const SidebarLayout = dynamic(() => import('@/components/ui/sidebar-layout'), { ssr: false });

export default function ConditionalSidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOrRootPage = pathname === '/' || pathname.startsWith('/sign-in');
  return isAuthOrRootPage ? <>{children}</> : <SidebarLayout>{children}</SidebarLayout>;
} 