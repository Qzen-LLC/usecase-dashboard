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
import { UserButton } from '@/components/auth';
import { useUserClient, useAuthClient } from '@/hooks/useAuthClient';
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
  const { user, isLoaded: userLoaded } = useUserClient();
  const { isSignedIn } = useAuthClient();
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
  if (!mounted || !dataReady || !userLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-56'} bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out flex flex-col font-brandSans`}>
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
            <div className="flex items-center gap-2.5 p-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-card">
                <Image src="https://vgwacd4qotpurdv6.public.blob.vercel-storage.com/logo/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground leading-tight">QUBE</span>
                <span className="text-[10px] text-muted-foreground leading-tight">AI Platform</span>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-2 ${isCollapsed ? 'space-y-2' : 'space-y-2'}`}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`
                  ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-2 px-3 py-2'} 
                  rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-primary' 
                    : item.isAdmin 
                      ? 'bg-accent/10 text-accent-foreground border-l-4 border-accent hover:bg-accent/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                  }
                `}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : item.isAdmin ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span className="text-xs font-normal leading-snug">{item.title}</span>
                      {/* Compact mode hides descriptions to reduce vertical space */}
                      {item.isAdmin && (
                        <span className="text-[10px] text-accent-foreground font-normal leading-snug">Admin Only</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Settings and Help Buttons */}
        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => {
              // TODO: Add settings functionality
              console.log('Settings button clicked');
            }}
            className={`
              w-full ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-2 px-2.5 py-1.5'} 
              rounded-lg transition-all duration-200 group
              text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm
            `}
          >
            <Settings className={`w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground`} />
            {!isCollapsed && (
              <span className="text-xs font-normal leading-tight">Settings</span>
            )}
          </button>
          
          <button
            onClick={() => {
              // TODO: Add help functionality
              console.log('Help button clicked');
            }}
            className={`
              w-full ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-2 px-2.5 py-1.5'} 
              rounded-lg transition-all duration-200 group
              text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm
            `}
          >
            <HelpCircle className={`w-4 h-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground`} />
            {!isCollapsed && (
              <span className="text-xs font-normal leading-tight">Help</span>
            )}
          </button>
        </div>
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
                    {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
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