"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookX } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

export default function NotFound() {
  const userRole = useUserStore((state) => state.userRole);
  const dashboardPath =
    userRole === "admin" ? "/admin/dashboard" : "/salesperson/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center space-y-8 text-center max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-xl" />
          <div className="relative rounded-full bg-background/95 p-6 ring-1 ring-border">
            <BookX className="h-16 w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
            Oops!
          </h1>
          <h2 className="text-3xl font-medium text-foreground">
            404 - Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like this page took an unexpected vacation. Let's get you back
            on track!
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          className="hover:shadow-md dark:hover:shadow-primary/10 transition-all"
          asChild
        >
          <Link href={dashboardPath}>Return to Campus</Link>
        </Button>
      </div>
    </div>
  );
}
