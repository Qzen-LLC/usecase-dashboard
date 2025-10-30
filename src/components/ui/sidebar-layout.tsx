'use client'
import AppSidebar from "@/components/ui/nested-sidebar"
import ThemeToggle from "@/components/ui/theme-toggle"
import UserButton from "@/components/auth/UserButton"
import { Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuthClient, useUserClient } from "@/hooks/useAuthClient"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuthClient();
  const { user } = useUserClient<any>();

  const sidebarItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Executive Dashboard", href: "/dashboard/executive" },
    { title: "Usecases", href: "/dashboard" },
    { title: "Usecase Development", href: "/dashboard/use-case-development" },
    { title: "Risk Management", href: "/dashboard/risks" },
    { title: "Vendor Management", href: "/dashboard/vendor-assessment" },
    { title: "FinOps Dashboard", href: "/dashboard/finops-dashboard" },
    { title: "Policy Center", href: "/dashboard/policy-center" },
    { title: "Governance Dashboard", href: "/dashboard/governance" },
  ];

  const activeTitle = (
    sidebarItems.find((item) => {
      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
      return isActive;
    })?.title || "Dashboard"
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top Navigation Bar */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <h1 className="text-xl font-semibold text-foreground">{activeTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm text-muted-foreground font-medium">
                    {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "User"}
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
        {/* Render actual page content */}
        <div className="flex flex-1 flex-col p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
