"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, User, Phone, Settings, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/salesperson/dashboard",
      active: pathname === "/salesperson/dashboard",
    },
    {
      label: "Profile",
      icon: User,
      href: "/salesperson/profile",
      active: pathname === "/salesperson/profile",
    },
    {
      label: "Calls",
      icon: Phone,
      href: "/salesperson/calls",
      active: pathname === "/salesperson/calls",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/salesperson/settings",
      active: pathname === "/salesperson/settings",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card text-card-foreground w-[200px]">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                route.active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon
                  className={cn(
                    "h-5 w-5 mr-3",
                    route.active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          onClick={() => logout()}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
