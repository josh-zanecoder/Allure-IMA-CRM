"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface LayoutProps {
  children: React.ReactElement;
  params: Promise<{ id: string }>;
}

export default function ProspectLayout({ children, params }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const tabs = [
    { name: "Details", href: `/salesperson/prospects/${id}/details` },
    { name: "Reminders", href: `/salesperson/prospects/${id}/reminders` },
    { name: "Activities", href: `/salesperson/prospects/${id}/activities` },
  ];

  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setProgress(0);
    router.push(value);
  };

  // Reset loading state when pathname changes
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isLoading]);

  // Progress animation
  React.useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full px-3 sm:px-6 py-3 sm:py-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 sm:mb-6 -ml-1 sm:-ml-2 gap-1 sm:gap-2 text-muted-foreground hover:text-foreground h-9 sm:h-10"
          asChild
        >
          <Link href="/salesperson/prospects">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Prospects</span>
          </Link>
        </Button>

        <Tabs
          value={pathname}
          className="w-full space-y-4 sm:space-y-6"
          onValueChange={handleTabChange}
        >
          <div className="sm:border-b sm:border-border">
            <TabsList className="grid grid-cols-2 sm:flex sm:flex-row gap-1 sm:gap-0 rounded-none bg-transparent p-0 h-auto sm:h-[42px] w-full justify-between">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.name}
                  value={tab.href}
                  className="relative h-[38px] sm:h-[42px] rounded-md sm:rounded-none border sm:border-0 border-border sm:border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-2 sm:px-4 text-sm sm:text-base font-medium data-[state=active]:bg-primary/5 sm:data-[state=active]:bg-transparent data-[state=active]:border-primary sm:data-[state=active]:border-primary data-[state=active]:shadow-none sm:flex-1 text-center"
                  disabled={isLoading}
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="rounded-lg relative min-h-[200px]">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                <Progress value={progress} className="w-[60%] max-w-[300px]" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            )}
            <div className="relative">{children}</div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
