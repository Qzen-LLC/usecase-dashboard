"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Folder,
  Frame,
  PieChart,
  Settings2,
  Shield,
  SquareTerminal,
  Users,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavProjects } from "@/components/ui/nav-projects"
import { useState } from "react"
import { useEffect } from "react"
import { useAuthClient, useUserClient } from "@/hooks/useAuthClient"
import { useUserData } from "@/contexts/UserContext"
import { usePathname } from "next/navigation"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Qube Admin Settings",
      url: "",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "General Settings",
          url: "/admin",
        },
        {
          title: "Question Templates",
          url: "/admin/configure-questions",
        },
        {
          title: "AI Models",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Executive Dashboard",
      url: "/dashboard/executive",
      icon: Frame,
    },
    {
      name: "Usecases",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      name: "Usecase Development",
      url: "/dashboard/use-case-development",
      icon: Folder,
    },
    {
        name: "Risk Management",
        url: "/dashboard/risks",
        icon: Shield,
    },
    {
        name: "Vendor Management",
        url: "/dashboard/vendor-assessment",
        icon: Users,
    },
    {
        name: "FinOps Dashboard",
        url: "/dashboard/finops-dashboard",
        icon: Users,
    },
    {
        name: "Policy Center",
        url: "/dashboard/policy-center",
        icon: Users,
    },
    {
        name: "Governance Dashboard",
        url: "/dashboard/governance",
        icon: Users,
    },
  ],
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        {userData?.role === 'QZEN_ADMIN' && (
          <NavMain items={data.navMain} />
        )}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

