"use client";

import * as React from "react";
import { LayoutDashboard, Users, Command } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { StudentSwitcher } from "@/components/student-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserStore } from "@/store/useUserStore";
import { usePaginationStore } from "@/store/usePaginationStore";
import { useEffect, useState } from "react";
import { SidebarData } from "@/types/sidebar";
import { SidebarSkeleton } from "@/components/ui/sidebar-skeleton";

const salesPersonNavItems = [
  {
    title: "Dashboard",
    url: "/salesperson/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/salesperson/dashboard",
  },
  {
    title: "Prospects",
    url: "/salesperson/prospects",
    icon: Users,
    isActive: (pathname: string) =>
      pathname.startsWith("/salesperson/prospects"),
  },
];

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/admin/dashboard",
  },
  {
    title: "Sales Team",
    url: "/admin/salespersons",
    icon: Users,
    isActive: (pathname: string) => pathname.startsWith("/admin/salespersons"),
  },
];

const defaultNavItems = [
  {
    title: "",
    url: "#",
    icon: LayoutDashboard,
    isActive: () => false,
  },
];

const defaultUser = {
  name: "Allure IMA",
  email: "m@example.com",
  avatar: "/allurelogo.png",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userRole, students, userData, getUser } = useUserStore();
  const { fetchProspects } = usePaginationStore();
  const [data, setData] = useState<SidebarData>({
    user: defaultUser,
    navMain: salesPersonNavItems || adminNavItems,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    setLoading(true);
    getUser();
    setLoading(false);
  }, [getUser]);

  // Fetch prospects for the sidebar when in salesperson role
  useEffect(() => {
    setLoading(true);
    if (userRole === "salesperson") {
      fetchProspects();
    }
    setLoading(false);
  }, [userRole, fetchProspects]);

  // Update sidebar data when user or students change
  useEffect(() => {
    if (!userData || !userRole || !students) {
      setLoading(false);
      return;
    }

    const updateSidebarData = async () => {
      setLoading(true);
      try {
        const updatedUser = {
          name:
            userData?.firstName && userData?.lastName
              ? `${userData.firstName} ${userData.lastName}`
              : userData?.firstName ||
                userData?.lastName ||
                userData?.displayName ||
                defaultUser.name,
          email: userData?.email || defaultUser.email,
          avatar: userData?.avatar || defaultUser.avatar,
        };

        if (userRole === "salesperson") {
          setData({
            user: updatedUser,
            students: students.map((student: any) => ({
              id: student.id,
              name: student.fullName,
              email: student.email || "",
              logo: Command as React.ElementType,
            })),
            navMain: salesPersonNavItems,
          });
        } else if (userRole === "admin") {
          setData({
            user: updatedUser,
            navMain: adminNavItems,
          });
        } else {
          setData({
            user: updatedUser,
            navMain: defaultNavItems,
          });
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
        setData({
          user: defaultUser,
          navMain: defaultNavItems,
        });
      } finally {
        setLoading(false);
      }
    };

    updateSidebarData();
  }, [userRole, students, userData]);

  if (loading) {
    return <SidebarSkeleton />;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <StudentSwitcher students={data.students ?? []} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
