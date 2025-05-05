"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: (pathname: string) => boolean;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (isMobile) {
      e.preventDefault();
      setOpenMobile(false);
      // Match the sidebar's transition duration exactly (200ms)
      setTimeout(() => {
        router.push(url);
      }, 200);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.isActive
              ? item.isActive(pathname)
              : pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  disabled={isActive}
                >
                  <Link
                    href={item.url}
                    className={`flex items-center gap-3 ${
                      isActive ? "pointer-events-none opacity-70" : ""
                    }`}
                    onClick={(e) => !isActive && handleClick(e, item.url)}
                  >
                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
