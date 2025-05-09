"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
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
  const { fetchProspects, lastFetchStatus } = usePaginationStore();
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isAddingProspect, setIsAddingProspect] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Effect to redirect if not a salesperson
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "salesperson")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Effect to fetch prospects when user is loaded - only once
  useEffect(() => {
    if (user && !initialFetchDone) {
      fetchProspects();
      setInitialFetchDone(true);
    }
  }, [user, fetchProspects, initialFetchDone]);

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

  // Effect for add prospect progress animation
  useEffect(() => {
    if (isAddingProspect) {
      const timer = setInterval(() => {
        setAddProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            setShouldNavigate(true);
            return 95;
          }
          return prev + 15;
        });
      }, 50);
      return () => clearInterval(timer);
    } else {
      setAddProgress(0);
      setShouldNavigate(false);
    }
  }, [isAddingProspect]);

  // Separate effect for navigation to avoid React errors
  useEffect(() => {
    if (shouldNavigate) {
      // Small timeout to ensure state updates are processed first
      const navigationTimer = setTimeout(() => {
        router.push("/salesperson/prospects/new");
      }, 10);
      return () => clearTimeout(navigationTimer);
    }
  }, [shouldNavigate, router]);

  const handleAddProspect = useCallback(() => {
    setIsAddingProspect(true);
  }, []);

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

  // Render add prospect loading state
  if (isAddingProspect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 w-[250px]">
          <Progress value={addProgress} className="w-full" />
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Creating new prospect...
            </p>
          </div>
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
          onClick={handleAddProspect}
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
