"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/useUserStore";
import { usePaginationStore } from "@/store/usePaginationStore";
import { ProspectPagination } from "@/components/ProspectPagination";
import { ProspectSearch } from "@/components/ProspectSearch";
import { ProspectList } from "@/components/ProspectList";
import { Button } from "@/components/ui/button";

export default function ProspectsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const { fetchProspects } = usePaginationStore();

  // Effect to redirect if not a salesperson
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "salesperson")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Effect to fetch prospects when user is loaded
  useEffect(() => {
    if (user) {
      fetchProspects();
    }
  }, [user, fetchProspects]);

  // Effect for loading progress animation
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 10;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 w-[200px]">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">Loading prospects...</p>
        </div>
      </div>
    );
  }

  // Render null state
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Prospects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track your prospects
          </p>
        </div>
        <Button
          onClick={() => router.push("/salesperson/prospects/new")}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Prospect
        </Button>
      </div>

      {/* Search Input */}
      <ProspectSearch />

      {/* Prospects List */}
      <ProspectList />

      {/* Pagination */}
      <ProspectPagination />
    </div>
  );
}
