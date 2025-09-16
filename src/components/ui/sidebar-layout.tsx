'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Building, 
  DollarSign, 
  FileText, 
  Shield,
  Home,
  Settings,
  HelpCircle,
  Code2
} from 'lucide-react';
import { Button } from './button';
import { UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useUserData } from '@/contexts/UserContext';
import ThemeToggle from './theme-toggle';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  isAdmin?: boolean;
}

const navigationItems: NavigationItem[] = [
  // Admin Dashboard for QZEN_ADMIN
  // This will be conditionally added below
  {
    title: 'Executive Dashboard',
    href: '/dashboard/executive',
    icon: LayoutDashboard,
    description: 'Executive Overview'
  },
  {
    title: 'Use Cases',
    href: '/dashboard',
    icon: Home,
    description: 'AI Use Cases'
  },
  {
    title: 'Use Case Development',
    href: '/dashboard/use-case-development',
    icon: Code2,
    description: 'Prompt Engineering'
  },
  {
    title: 'Risk Management',
    href: '/dashboard/risks',
    icon: ShieldCheck,
    description: 'Risk Assessment'
  },
  {
    title: 'Vendor Assessment',
    href: '/dashboard/vendor-assessment',
    icon: Building,
    description: 'Vendor Evaluation'
  },
  {
    title: 'FinOps Dashboard',
    href: '/dashboard/finops-dashboard',
    icon: DollarSign,
    description: 'Financial Operations'
  },
  {
    title: 'Policy Center',
    href: '/dashboard/policy-center',
    icon: FileText,
    description: 'Policy Management'
  },
  {
    title: 'Governance',
    href: '/dashboard/governance',
    icon: Shield,
    description: 'Compliance & Governance'
  }
];

interface SidebarLayoutProps {
  children: React.ReactNode;
}

function SidebarLayoutContent({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const { userData } = useUserData();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    // Wait a bit for user data to be loaded
    const timer = setTimeout(() => {
      setDataReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Build sidebar items, add Admin Dashboard for QZEN_ADMIN and Manage Users for ORG_ADMIN
  const sidebarItems = [
    ...(userData?.role === 'QZEN_ADMIN'
      ? [{
          title: 'Admin Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          description: 'Platform Admin'
        }]
      : []),
    ...(userData?.role === 'ORG_ADMIN'
      ? [{
          title: 'Manage Users',
          href: '/dashboard/users',
          icon: Users,
          description: 'User Management',
          isAdmin: true // Add flag for styling
        }]
      : []),
      ...(userData?.role === 'ORG_ADMIN'
        ? [{
            title: 'Configure Questions',
            href: '/dashboard/configure-questions',
            icon: Users,
            description: 'Question Management',
            isAdmin: true // Add flag for styling
          }]
        : []),
    ...navigationItems
  ];

  // Don't render until mounted and data is ready to prevent hydration mismatch
  if (!mounted || !dataReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo and Brand */}
        <div className="border-b border-border">
          {isCollapsed ? (
            <div className="flex flex-col items-center p-4 gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white">
                <Image src="https://vgwacd4qotpurdv6.public.blob.vercel-storage.com/logo/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-card">
                <Image src="https://vgwacd4qotpurdv6.public.blob.vercel-storage.com/logo/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-foreground leading-tight">QUBE</span>
                <span className="text-xs text-muted-foreground leading-tight">AI Platform</span>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-2 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-3 px-3 py-2.5'} 
                  rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-primary font-medium' 
                    : item.isAdmin 
                      ? 'bg-accent/10 text-accent-foreground border-l-4 border-accent hover:bg-accent/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                  }
                `}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : item.isAdmin ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{item.title}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{item.description}</span>
                      {item.isAdmin && (
                        <span className="text-xs text-accent-foreground font-medium">Admin Only</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground">
                {sidebarItems.find(item => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return isActive;
                })?.title || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm text-muted-foreground font-medium">
                    {user.fullName || user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Guest</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return <SidebarLayoutContent>{children}</SidebarLayoutContent>;
}