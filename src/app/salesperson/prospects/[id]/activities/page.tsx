"use client";

import React, { useState, useEffect } from "react";
import { Activity, ActivityStatus } from "@/types/activity";
import AddEditActivityModal from "@/components/salesperson/AddEditActivityModal";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Pencil,
  AlertCircle,
  Loader2,
  Plus,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

function formatDate(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusVariant(
  status: string
): "default" | "destructive" | "secondary" | "completed" {
  switch (status) {
    case ActivityStatus.COMPLETED:
      return "completed";
    case ActivityStatus.IN_PROGRESS:
      return "default";
    case ActivityStatus.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
}

// Custom color mapping for status to apply border color
function getStatusColor(status: string): string {
  switch (status) {
    case ActivityStatus.COMPLETED:
      return "bg-green-500/20 text-green-300";
    case ActivityStatus.IN_PROGRESS:
      return "bg-blue-500/20 text-blue-300";
    case ActivityStatus.CANCELLED:
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-zinc-500/20 text-zinc-300";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ActivitiesPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);

  const fetchActivities = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/prospects/${id}/activities`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch activities");
      }
      const activitiesData = await response.json();
      setActivities(activitiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchActivities();
    }
  }, [id, fetchActivities]);

  const handleAddActivity = async (
    activity: Omit<Activity, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    try {
      let dueDate: string;

      if (typeof activity.dueDate === "string") {
        dueDate = activity.dueDate;
      } else if (activity.dueDate && typeof activity.dueDate === "object") {
        try {
          dueDate = (activity.dueDate as Date).toISOString();
        } catch (error) {
          console.error("Error converting date:", error);
          dueDate = new Date().toISOString();
        }
      } else {
        dueDate = new Date().toISOString();
      }

      const response = await fetch(`/api/prospects/${id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activity,
          dueDate,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add activity");
      }
      setIsModalOpen(false);
      await fetchActivities();
    } catch (err) {
      console.error("Error adding activity:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add activity"
      );
    }
  };

  const handleDeleteClick = (activityId: string) => {
    setDeleteActivityId(activityId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteActivityId) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting activity...");

    try {
      const response = await fetch(
        `/api/prospects/${id}/activities/${deleteActivityId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete activity");
      }

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity._id !== deleteActivityId)
      );
      toast.success("Activity removed successfully", {
        id: loadingToast,
      });
    } catch (err) {
      console.error("Error deleting activity:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete activity",
        {
          id: loadingToast,
        }
      );
      fetchActivities();
    } finally {
      setIsDeleting(false);
      setDeleteActivityId(null);
    }
  };

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleEditActivity = async (
    activity: Omit<Activity, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    if (!editingActivity) return;
    try {
      let dueDate: string;

      if (typeof activity.dueDate === "string") {
        dueDate = activity.dueDate;
      } else if (activity.dueDate && typeof activity.dueDate === "object") {
        try {
          dueDate = (activity.dueDate as Date).toISOString();
        } catch (error) {
          console.error("Error converting date:", error);
          dueDate = new Date().toISOString();
        }
      } else {
        dueDate = new Date().toISOString();
      }

      const response = await fetch(
        `/api/prospects/${id}/activities/${editingActivity._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...activity,
            dueDate,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update activity");
      }

      setIsEditModalOpen(false);
      setEditingActivity(null);
      await fetchActivities();
    } catch (err) {
      console.error("Error updating activity:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update activity"
      );
    }
  };

  const openPreviewModal = (activity: Activity) => {
    setPreviewActivity(activity);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="h-[140px] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Activities</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivities}
          className="mt-2"
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Activities</h1>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="rounded-full gap-1.5 font-medium px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-zinc-800 p-4 rounded-full mb-4">
            <Calendar className="h-10 w-10 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No activities yet</h3>
          <p className="mb-6 text-sm text-center text-zinc-400 max-w-md">
            Track your interactions with this prospect by adding activities.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Add First Activity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="relative bg-zinc-900 rounded-xl overflow-hidden ring-1 ring-zinc-800 hover:ring-zinc-700 transition-all duration-200 max-h-[200px] flex flex-col"
            >
              {/* Status Bar at Top */}
              <div
                className={`h-1.5 w-full ${
                  getStatusColor(activity.status).split(" ")[0]
                }`}
              ></div>

              {/* Header with Title and Status */}
              <div className="p-3 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium text-zinc-100 overflow-hidden text-ellipsis break-words min-h-[3rem] max-h-[3rem] line-clamp-2">
                    {activity.title}
                  </h3>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                      activity.status
                    )} flex-shrink-0 whitespace-nowrap mt-0.5`}
                  >
                    {activity.status}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-3 pt-1 pb-2 flex-1 flex flex-col">
                <p className="text-sm text-zinc-300 mb-3 overflow-hidden text-ellipsis break-words min-h-[2.75rem] max-h-[2.75rem] line-clamp-2 leading-relaxed">
                  {activity.description || "No description provided."}
                </p>

                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center text-xs">
                    <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-zinc-500" />
                    <span className="truncate text-zinc-400 font-medium">
                      {formatDate(activity.dueDate)}
                    </span>
                  </div>

                  {activity.completedDate && (
                    <div className="flex items-center text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-green-400" />
                      <span className="truncate text-zinc-400 font-medium">
                        {formatDate(activity.completedDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-800 p-2 flex justify-end gap-1.5 bg-zinc-900/80">
                <button
                  onClick={() => openPreviewModal(activity)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleEditClick(activity)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(activity._id)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-800/60 text-zinc-500 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddActivity}
        prospectId={id}
      />

      <AddEditActivityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleEditActivity}
        prospectId={id}
        initialData={editingActivity || undefined}
        mode="edit"
      />

      <AlertDialog
        open={!!deleteActivityId}
        onOpenChange={() => setDeleteActivityId(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Preview Modal */}
      <Dialog
        open={!!previewActivity}
        onOpenChange={(open) => !open && setPreviewActivity(null)}
      >
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col bg-zinc-900 border-zinc-800">
          <DialogHeader className="border-b border-zinc-800 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-xl font-semibold text-zinc-100 overflow-hidden text-ellipsis line-clamp-2 break-words mr-2">
                {previewActivity?.title}
              </DialogTitle>
              <div
                className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                  previewActivity && getStatusColor(previewActivity.status)
                } flex-shrink-0 whitespace-nowrap`}
              >
                {previewActivity?.status}
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 mt-3 pr-2 custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-zinc-300">
                  Description
                </h4>
                <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar border border-zinc-800 rounded-md p-3 bg-zinc-900/50">
                  <p className="text-base text-zinc-200 whitespace-normal break-words leading-relaxed">
                    {previewActivity?.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300">
                    Due:{" "}
                    {previewActivity && formatDate(previewActivity.dueDate)}
                  </span>
                </div>

                {previewActivity?.completedDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-zinc-300">
                      Completed: {formatDate(previewActivity.completedDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-zinc-800 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewActivity) {
                  handleEditClick(previewActivity);
                  setPreviewActivity(null);
                }
              }}
              className="gap-1 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <DialogClose asChild>
              <Button
                size="sm"
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
              >
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 30, 30, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 100, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 120, 120, 0.6);
        }
      `}</style>
    </div>
  );
}
