'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Code2,
  Cog,
  GraduationCap,
  Leaf,
  Eye,
  Building2
} from 'lucide-react';
import { Button } from './button';
import { UserButton } from '@/components/auth';
import { useUserClient, useAuthClient } from '@/hooks/useAuthClient';
import Image from 'next/image';
import { useUserData } from '@/contexts/UserContext';
import ThemeToggle from './theme-toggle';

interface NavigationItem {
  title: string;
  href?: string;
  icon: React.ComponentType<any>;
  description: string;
  isAdmin?: boolean;
  children?: NavigationItem[];
  isCollapsible?: boolean;
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
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
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

  // Track previous pathname to detect actual navigation
  const prevPathnameRef = useRef(pathname);

  // Auto-close Organization Setup panel when navigating away from its sub-items
  useEffect(() => {
    if (dataReady && userData) {
      // Only check if pathname actually changed (not on initial render or menu state change)
      const pathnameChanged = prevPathnameRef.current !== pathname;
      
      if (pathnameChanged && expandedMenu === 'Organization Setup') {
        // Check if current path matches any Organization Setup sub-item
        const orgSetupPaths = [
          '/dashboard/configure-questions',
          '/dashboard/governance-setup',
          '/dashboard/training',
          '/dashboard/oversight',
          '/dashboard/sustainability'
        ];
        const isOrgSetupPath = orgSetupPaths.some(path => 
          pathname === path || pathname.startsWith(path)
        );
        
        // If we navigated away from Organization Setup pages, close the panel
        if (!isOrgSetupPath) {
          setExpandedMenu(null);
        }
      }
      
      // Update previous pathname
      prevPathnameRef.current = pathname;
    }
  }, [pathname, dataReady, userData, expandedMenu]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      // If collapsing, also close expanded menu
      setExpandedMenu(null);
    }
  };

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenu(expandedMenu === menuTitle ? null : menuTitle);
  };

  // Organization Setup sub-items
  const organizationSetupItems: NavigationItem[] = [
    ...(userData?.role === 'ORG_ADMIN'
      ? [{
          title: 'Configure Questions',
          href: '/dashboard/configure-questions',
          icon: HelpCircle,
          description: 'Question Management',
          isAdmin: true
        }]
      : []),
    {
      title: 'Governance Setup',
      href: '/dashboard/governance-setup',
      icon: Cog,
      description: 'Governance Configuration'
    },
    {
      title: 'Training & Competency',
      href: '/dashboard/training',
      icon: GraduationCap,
      description: 'AI Training Programs'
    },
    {
      title: 'Oversight & Monitoring',
      href: '/dashboard/oversight',
      icon: Eye,
      description: 'Governance Control Tower'
    },
    {
      title: 'Sustainable AI',
      href: '/dashboard/sustainability',
      icon: Leaf,
      description: 'Environmental Impact'
    }
  ];

  // Organization Setup parent item
  const organizationSetupItem: NavigationItem = {
    title: 'Organization Setup',
    icon: Building2,
    description: 'Organization Configuration',
    isCollapsible: true,
    children: organizationSetupItems
  };
  
  // Build sidebar items, add Admin Dashboard for QZEN_ADMIN and Manage Users for ORG_ADMIN
  const sidebarItems: NavigationItem[] = [
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
      ? [organizationSetupItem]
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

  // Check if current path matches any Organization Setup sub-item (for styling only)
  const isOrgSetupActive = organizationSetupItems.some(item => 
    item.href && (pathname === item.href || pathname.startsWith(item.href))
  );
  // Only show secondary panel when explicitly clicked, not auto-expanded
  const isOrgSetupExpanded = expandedMenu === 'Organization Setup';

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
        <nav className={`flex-1 p-2 ${isCollapsed ? 'space-y-2' : 'space-y-1'} overflow-y-auto main-sidebar-nav`}>
          {sidebarItems.map((item) => {
            const isActive = item.href && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
            const Icon = item.icon;
            const isCollapsible = item.isCollapsible && item.children;
            const isExpanded = isCollapsible && (item.title === 'Organization Setup' ? isOrgSetupExpanded : expandedMenu === item.title);
            
            if (isCollapsible) {
              if (isCollapsed) {
                // When collapsed, show just the icon
                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      setIsCollapsed(false);
                      // Small delay to ensure sidebar expands first, then open menu
                      setTimeout(() => toggleMenu(item.title), 100);
                    }}
                    className={`
                      w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 group
                      ${isOrgSetupActive 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                      }
                    `}
                    title={item.title}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isOrgSetupActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  </button>
                );
              }
              
              // When expanded, show full menu item with chevron
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${isOrgSetupActive 
                        ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isOrgSetupActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium leading-tight">{item.title}</span>
                    </div>
                  </button>
                </div>
              );
            }
            
            if (!item.href) return null;
            
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

        {/* Settings and Help Buttons */}
        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => {
              // TODO: Add settings functionality
              console.log('Settings button clicked');
            }}
            className={`
              w-full ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-3 px-3 py-2.5'} 
              rounded-lg transition-all duration-200 group
              text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm
            `}
          >
            <Settings className={`w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground`} />
            {!isCollapsed && (
              <span className="text-sm font-medium leading-tight">Settings</span>
            )}
          </button>
          
          <button
            onClick={() => {
              // TODO: Add help functionality
              console.log('Help button clicked');
            }}
            className={`
              w-full ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-3 px-3 py-2.5'} 
              rounded-lg transition-all duration-200 group
              text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm
            `}
          >
            <HelpCircle className={`w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground`} />
            {!isCollapsed && (
              <span className="text-sm font-medium leading-tight">Help</span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Side Panel for Organization Setup */}
      {isOrgSetupExpanded && !isCollapsed && userData?.role === 'ORG_ADMIN' && (
        <div className="w-64 bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out flex flex-col">
          <div className="border-b border-border p-2 flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedMenu(null)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <nav className="flex-1 p-2 overflow-y-auto">
            {organizationSetupItems.map((subItem) => {
              const isSubActive = subItem.href && (pathname === subItem.href || pathname.startsWith(subItem.href));
              const SubIcon = subItem.icon;
              
              return (
                <Link key={subItem.href} href={subItem.href || '#'}>
                    <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isSubActive 
                      ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-primary font-medium' 
                      : subItem.isAdmin 
                        ? 'bg-accent/10 text-accent-foreground border-l-4 border-accent hover:bg-accent/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm'
                    }
                  `}>
                    <SubIcon className={`w-5 h-5 flex-shrink-0 ${isSubActive ? 'text-primary' : subItem.isAdmin ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{subItem.title}</span>
                      {subItem.isAdmin && (
                        <span className="text-xs text-accent-foreground font-medium">Admin Only</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground">
                {(() => {
                  // Check Organization Setup sub-items first
                  const activeSubItem = organizationSetupItems.find(item => 
                    item.href && (pathname === item.href || pathname.startsWith(item.href))
                  );
                  if (activeSubItem) return activeSubItem.title;
                  
                  // Then check main sidebar items
                  const activeItem = sidebarItems.find(item => 
                    item.href && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                  );
                  return activeItem?.title || 'Dashboard';
                })()}
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