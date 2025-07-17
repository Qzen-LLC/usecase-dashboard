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
  HelpCircle
} from 'lucide-react';
import { Button } from './button';
import { UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';

const navigationItems = [
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

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => setUserRole(data.user?.role || null))
      .catch(() => setUserRole(null));
  }, [isSignedIn]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Build sidebar items, add Admin Dashboard for QZEN_ADMIN
  const sidebarItems = [
    ...(userRole === 'QZEN_ADMIN'
      ? [{
          title: 'Admin Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          description: 'Platform Admin'
        }]
      : []),
    ...navigationItems
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo and Brand */}
        <div className="border-b border-gray-200">
          {isCollapsed ? (
            <div className="flex flex-col items-center p-4 gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white">
                <Image src="https://blfsawovozyywndoiicu.supabase.co/storage/v1/object/sign/company/sharpened_logo_transparent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MjUwODc5My03NTY4LTQ5ZWYtOTJlMS1lYmU4MmM1YTUwYzQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wYW55L3NoYXJwZW5lZF9sb2dvX3RyYW5zcGFyZW50LnBuZyIsImlhdCI6MTc1MjA3ODUxMCwiZXhwIjo0OTA1Njc4NTEwfQ.ra2NZ9Flg45aZ-OLYnzc_xotXbyfOw3wOY3JgXWq9qw" alt="Logo" width={32} height={32} className="object-contain" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white">
                  <Image src="https://blfsawovozyywndoiicu.supabase.co/storage/v1/object/sign/company/sharpened_logo_transparent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MjUwODc5My03NTY4LTQ5ZWYtOTJlMS1lYmU4MmM1YTUwYzQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wYW55L3NoYXJwZW5lZF9sb2dvX3RyYW5zcGFyZW50LnBuZyIsImlhdCI6MTc1MjA3ODUxMCwiZXhwIjo0OTA1Njc4NTEwfQ.ra2NZ9Flg45aZ-OLYnzc_xotXbyfOw3wOY3JgXWq9qw" alt="Logo" width={32} height={32} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900">QZen QUBE</span>
                  <span className="text-xs text-gray-500 tracking-wide">AI Platform</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </Button>
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
                    ? 'bg-blue-50 text-blue-600 shadow-sm border-l-3 border-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                  }
                `}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{item.title}</span>
                      <span className="text-xs text-gray-500 leading-tight">{item.description}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={`p-2 border-t border-gray-200 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
          <div className={`
            ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-3 px-3 py-2'} 
            rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200
          `}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Settings</span>
                <span className="text-xs text-gray-500">System Config</span>
              </div>
            )}
          </div>
          <div className={`
            ${isCollapsed ? 'flex flex-col items-center justify-center p-2' : 'flex items-center gap-3 px-3 py-2'} 
            rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200
          `}>
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Help</span>
                <span className="text-xs text-gray-500">Support & Docs</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarItems.find(item => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return isActive;
                })?.title || 'Dashboard'}
              </h1>
              {/* Removed Admin Dashboard button from top bar */}
            </div>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/sign-in" />
                  <span className="text-sm text-gray-700 font-medium">
                    {user.fullName || user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">Guest</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}