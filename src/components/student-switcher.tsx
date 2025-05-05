"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Command } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const PROSPECT_TABS = [
  "details",
  "members",
  "reminders",
  "activities",
] as const;

export function StudentSwitcher({
  students,
}: {
  students: {
    id: string;
    name: string;
    email: string;
    logo: React.ElementType;
  }[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  // Find active college and tab based on URL
  const { activeStudent, activeTab } = React.useMemo(() => {
    const pathParts = pathname.split("/");
    const isProspectPage = pathParts.includes("prospects");
    if (!isProspectPage) return { activeStudent: null, activeTab: null };

    const studentIdIndex = pathParts.indexOf("prospects") + 1;
    const studentId = pathParts[studentIdIndex];
    const tab = pathParts[studentIdIndex + 1] as (typeof PROSPECT_TABS)[number];

    return {
      activeStudent: students.find((s) => s.id === studentId) || null,
      activeTab: PROSPECT_TABS.includes(tab) ? tab : "details",
    };
  }, [pathname, students]);

  const defaultStudent = {
    id: "",
    name: "Allure IMA",
    email: "System",
    logo: Command,
  };

  const currentStudent = activeStudent || defaultStudent;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <currentStudent.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentStudent.name}
                </span>
                <span className="truncate text-xs">{currentStudent.email}</span>
              </div>
              {students.length > 0 && <ChevronsUpDown className="ml-auto" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {students.length > 0 && (
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Colleges
              </DropdownMenuLabel>
              {students.map((student, index) => (
                <Link
                  key={student.id}
                  href={`/salesperson/prospects/${student.id}/${
                    activeTab || "details"
                  }`}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <student.logo className="size-3.5 shrink-0" />
                    </div>
                    {student.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </Link>
              ))}
              <DropdownMenuSeparator />
              <Link href="/salesperson/prospects">
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add student
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
