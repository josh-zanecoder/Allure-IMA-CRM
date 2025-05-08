import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {mounted ? (
            <Image
              src={
                theme === "dark"
                  ? "/allure-logo-light-sm.png"
                  : "/allure-logo-dark-sm.png"
              }
              alt="Allure IMA Logo"
              width={160}
              height={45}
              className="h-9 w-auto [filter:contrast(1.2)_brightness(1.1)] dark:[filter:contrast(1.3)_brightness(1.2)]"
            />
          ) : (
            <div style={{ width: 160, height: 45 }} />
          )}
          <span className="text-xl font-bold tracking-wider">Allure IMA</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
