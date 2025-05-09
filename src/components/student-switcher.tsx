"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Plus,
  Command,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePaginationStore } from "@/store/usePaginationStore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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

// Number of items to show per page in the dropdown
const ITEMS_PER_PAGE = 10;

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
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const {
    prospects,
    fetchProspects,
    isLoading,
    currentPage,
    totalPages,
    totalCount,
    setPage,
    lastFetchStatus,
  } = usePaginationStore();

  // Local pagination state for non-prospects pages
  const [localCurrentPage, setLocalCurrentPage] = useState(1);

  // Use prospects from the pagination store if available and on prospects page
  const isProspectsPage = pathname.includes("/salesperson/prospects");

  const displayStudents =
    isProspectsPage && prospects.length > 0
      ? prospects.map((prospect) => ({
          id: prospect.id,
          name: prospect.fullName,
          email: prospect.email || "",
          logo: Command as React.ElementType,
        }))
      : students;

  // Calculate local pagination values
  const localTotalPages = Math.ceil(displayStudents.length / ITEMS_PER_PAGE);
  const localPagedStudents = !isProspectsPage
    ? displayStudents.slice(
        (localCurrentPage - 1) * ITEMS_PER_PAGE,
        localCurrentPage * ITEMS_PER_PAGE
      )
    : displayStudents;

  // The actual students to display based on page type
  const studentsToDisplay = isProspectsPage
    ? displayStudents
    : localPagedStudents;

  // Fetch prospects when the component mounts if we're on the prospects page
  useEffect(() => {
    if (
      isProspectsPage &&
      prospects.length === 0 &&
      !isLoading &&
      lastFetchStatus !== "empty"
    ) {
      fetchProspects();
    }
  }, [
    pathname,
    prospects.length,
    fetchProspects,
    isLoading,
    isProspectsPage,
    lastFetchStatus,
  ]);

  // Refetch when page changes on prospects page
  useEffect(() => {
    if (isProspectsPage && lastFetchStatus !== "empty") {
      fetchProspects();
    }
  }, [currentPage, fetchProspects, isProspectsPage, lastFetchStatus]);

  // Find active prospect and tab based on URL
  const { activeStudent, activeTab } = React.useMemo(() => {
    const pathParts = pathname.split("/");
    const isProspectPage = pathParts.includes("prospects");
    if (!isProspectPage) return { activeStudent: null, activeTab: null };

    const studentIdIndex = pathParts.indexOf("prospects") + 1;
    const studentId = pathParts[studentIdIndex];
    const tab = pathParts[studentIdIndex + 1] as (typeof PROSPECT_TABS)[number];

    return {
      activeStudent: displayStudents.find((s) => s.id === studentId) || null,
      activeTab: PROSPECT_TABS.includes(tab) ? tab : "details",
    };
  }, [pathname, displayStudents]);

  const defaultStudent = {
    id: "",
    name: "Allure IMA",
    email: "System",
    logo: Command,
  };

  const currentStudent = activeStudent || defaultStudent;

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    router.push(
      `/salesperson/prospects/${studentId}/${activeTab || "details"}`
    );
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Handle pagination - use appropriate handlers based on page type
  const handlePrevPage = () => {
    if (isProspectsPage) {
      if (currentPage > 1) {
        setPage(currentPage - 1);
      }
    } else {
      if (localCurrentPage > 1) {
        setLocalCurrentPage(localCurrentPage - 1);
      }
    }
  };

  const handleNextPage = () => {
    if (isProspectsPage) {
      if (currentPage < totalPages) {
        setPage(currentPage + 1);
      }
    } else {
      if (localCurrentPage < localTotalPages) {
        setLocalCurrentPage(localCurrentPage + 1);
      }
    }
  };

  // Get the appropriate pagination values based on page type
  const paginationValues = isProspectsPage
    ? { current: currentPage, total: totalPages, count: totalCount }
    : {
        current: localCurrentPage,
        total: localTotalPages,
        count: displayStudents.length,
      };

  // Determine if pagination should be shown
  const showPagination =
    (isProspectsPage && totalPages > 1) ||
    (!isProspectsPage && localTotalPages > 1);

  // Admin view (static display, no dropdown)
  if (isAdmin) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-1 bg-black dark:bg-white">
                <Image
                  src={
                    theme === "dark"
                      ? "/allure-logo-dark-sm.png"
                      : "/allure-logo-light-sm.png"
                  }
                  alt="Allure IMA Logo"
                  width={24}
                  height={24}
                  className="size-6 object-contain [filter:contrast(1.2)_brightness(1.1)] dark:[filter:contrast(1.3)_brightness(1.2)]"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {defaultStudent.name}
                </span>
                <span className="truncate text-xs">{defaultStudent.email}</span>
              </div>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Salesperson view (with dropdown)
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-1 bg-black dark:bg-white">
                <Image
                  src={
                    theme === "dark"
                      ? "/allure-logo-dark-sm.png"
                      : "/allure-logo-light-sm.png"
                  }
                  alt="Allure IMA Logo"
                  width={24}
                  height={24}
                  className="size-6 object-contain [filter:contrast(1.2)_brightness(1.1)] dark:[filter:contrast(1.3)_brightness(1.2)]"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentStudent.name}
                </span>
                <span className="truncate text-xs">{currentStudent.email}</span>
              </div>
              {displayStudents.length > 0 && (
                <ChevronsUpDown className="ml-auto" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {displayStudents.length > 0 && (
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs flex justify-between">
                <span>
                  {isLoading
                    ? "Loading students..."
                    : `Students (${paginationValues.count})`}
                </span>
                {showPagination && (
                  <span className="text-xs text-muted-foreground">
                    Page {paginationValues.current} of {paginationValues.total}
                  </span>
                )}
              </DropdownMenuLabel>

              {isLoading ? (
                <DropdownMenuItem disabled className="opacity-50 p-2">
                  <div className="flex items-center justify-center w-full py-1">
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-zinc-500 animate-spin"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </DropdownMenuItem>
              ) : (
                studentsToDisplay.map((student, index) => (
                  <DropdownMenuItem
                    key={student.id}
                    className="gap-2 p-2 cursor-pointer"
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <student.logo className="size-3.5 shrink-0" />
                    </div>
                    {student.name}
                    <DropdownMenuShortcut>
                      ⌘
                      {index +
                        1 +
                        (paginationValues.current - 1) * ITEMS_PER_PAGE}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))
              )}

              {/* Pagination Controls */}
              {showPagination && (
                <div className="flex items-center justify-between px-2 py-1 border-t border-border">
                  <button
                    onClick={handlePrevPage}
                    disabled={paginationValues.current === 1 || isLoading}
                    className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={
                      paginationValues.current === paginationValues.total ||
                      isLoading
                    }
                    className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <DropdownMenuSeparator />
              <Link href="/salesperson/prospects/new">
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
