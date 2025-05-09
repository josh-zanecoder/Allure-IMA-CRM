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
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

function formatDate(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Get date in "Month Day, Year" format
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get time in 12-hour format with AM/PM
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} at ${formattedTime}`;
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
  const [activeTab, setActiveTab] = useState("all");

  const fetchActivities = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios.get(`/api/prospects/${id}/activities`);
      const activitiesData = response.data;
      setActivities(activitiesData);
    } catch (err) {
      console.error("Error fetching activities:", err);
      let errorMessage = "An error occurred";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || "Failed to fetch activities";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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

      await axios.post(`/api/prospects/${id}/activities`, {
        ...activity,
        dueDate,
      });

      setIsModalOpen(false);
      await fetchActivities();
    } catch (err) {
      console.error("Error adding activity:", err);
      let errorMessage = "Failed to add activity";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || "Failed to add activity";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
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
      await axios.delete(`/api/prospects/${id}/activities/${deleteActivityId}`);

      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity._id !== deleteActivityId)
      );
      toast.success("Activity removed successfully", {
        id: loadingToast,
      });
    } catch (err) {
      console.error("Error deleting activity:", err);
      let errorMessage = "Failed to delete activity";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || "Failed to delete activity";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, {
        id: loadingToast,
      });
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

      await axios.put(
        `/api/prospects/${id}/activities/${editingActivity._id}`,
        {
          ...activity,
          dueDate,
        }
      );

      setIsEditModalOpen(false);
      setEditingActivity(null);
      await fetchActivities();
    } catch (err) {
      console.error("Error updating activity:", err);
      let errorMessage = "Failed to update activity";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || "Failed to update activity";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleMarkComplete = async (activityId: string) => {
    try {
      await axios.put(`/api/prospects/${id}/activities/${activityId}`, {
        status: ActivityStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      });

      await fetchActivities();
      toast.success("Activity marked as complete");
    } catch (err) {
      console.error("Error completing activity:", err);
      let errorMessage = "Failed to mark activity as complete";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage =
          err.response.data.error || "Failed to mark activity as complete";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const openPreviewModal = (activity: Activity) => {
    setPreviewActivity(activity);
  };

  // Filter activities based on active tab
  const filteredActivities =
    activeTab === "all"
      ? activities
      : activities.filter(
          (activity) =>
            activity.status ===
            ActivityStatus[
              activeTab.toUpperCase() as keyof typeof ActivityStatus
            ]
        );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
            <Skeleton className="h-5 w-24 sm:h-6 sm:w-32" />
          </div>
          <Skeleton className="h-8 w-20 sm:h-9 sm:w-24" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden min-h-[180px] sm:min-h-[220px]"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex-1">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="mr-2 flex-1">
                      <Skeleton className="h-5 w-32 sm:h-6 sm:w-40 mb-1" />
                    </div>
                    <Skeleton className="h-5 w-16 sm:h-6 sm:w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-3/4 mb-3 sm:mb-4" />
                  <div className="mt-auto">
                    <Skeleton className="h-4 w-28 sm:h-5 sm:w-32 mb-2" />
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-800 p-2 sm:p-3 flex justify-end gap-1 sm:gap-2 bg-gray-50/80 dark:bg-zinc-900/80">
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                  <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="mx-auto max-w-2xl m-4 sm:m-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
      >
        <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
        <AlertTitle className="text-gray-900 dark:text-white">
          Error Loading Activities
        </AlertTitle>
        <AlertDescription className="text-gray-500 dark:text-zinc-400">
          {error}
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivities}
          className="mt-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-200"
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-8 bg-white dark:bg-zinc-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 sm:p-2 rounded-full">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-zinc-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Activities
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
              Manage activities for this prospect
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="rounded-full gap-1.5 font-medium px-3 sm:px-4 bg-gray-900 hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 w-full sm:w-auto"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Add Activity
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        className="space-y-3 sm:space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 -mx-2 px-2">
            <TabsList className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-max sm:w-auto mb-2 sm:mb-0 flex-nowrap min-w-full">
              <TabsTrigger
                value="all"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="in_progress"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                Cancelled
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 ml-auto sm:ml-0">
            {filteredActivities.length}{" "}
            {filteredActivities.length === 1 ? "activity" : "activities"}
          </div>
        </div>

        <TabsContent value={activeTab} className="m-0">
          {filteredActivities.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center py-8 sm:py-12 px-3 sm:px-4">
              <div className="bg-gray-100 dark:bg-zinc-800 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-zinc-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                No activities found
              </h3>
              <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-center text-gray-500 dark:text-zinc-400 max-w-md">
                {activeTab === "all"
                  ? "You haven't created any activities yet. Add one to get started."
                  : `No ${activeTab
                      .toLowerCase()
                      .replace("_", " ")} activities found.`}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-full gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-200 text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add Activity
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.map((activity) => (
                <Card
                  key={activity._id}
                  className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors overflow-hidden"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="px-3 sm:px-5 pt-3 pb-3 sm:pb-5 border-b border-gray-200 dark:border-zinc-800 flex-1 bg-gray-50/50 dark:bg-zinc-900/20">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="mr-2 flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-zinc-200 text-sm sm:text-base truncate max-w-[240px]">
                            {activity.title}
                          </h3>
                        </div>
                        <div
                          className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                            activity.status
                          )} flex-shrink-0 whitespace-nowrap`}
                        >
                          {activity.status}
                        </div>
                      </div>

                      <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-3 mb-3 sm:mb-4 min-h-[2.5rem] sm:min-h-[3rem]">
                        {activity.description || "No description provided."}
                      </p>

                      <div className="mt-auto space-y-1.5 sm:space-y-2">
                        <div className="flex items-center text-xs sm:text-sm">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400 dark:text-zinc-500" />
                          <span className="truncate text-gray-900 dark:text-zinc-300 font-medium">
                            {formatDate(activity.dueDate)}
                          </span>
                        </div>

                        {activity.completedDate && (
                          <div className="flex items-center text-xs sm:text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0 text-green-500 dark:text-green-400" />
                            <span className="truncate text-gray-900 dark:text-zinc-300 font-medium">
                              {formatDate(activity.completedDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-zinc-800 px-2 sm:px-3 py-2 sm:pt-3 flex justify-end gap-1.5 sm:gap-2 bg-white/80 dark:bg-zinc-900/80">
                      <button
                        onClick={() => openPreviewModal(activity)}
                        className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      {activity.status !== ActivityStatus.COMPLETED && (
                        <button
                          onClick={() => handleMarkComplete(activity._id)}
                          className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(activity)}
                        className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                        title="Edit Activity"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(activity._id)}
                        className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-red-100 dark:bg-red-800/60 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-300 transition-colors"
                        title="Delete Activity"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
        <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-zinc-400">
              This action cannot be undone. This will permanently delete the
              activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90"
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
      {previewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div
            className="fixed inset-0 bg-gray-500/80 dark:bg-black/80"
            onClick={() => setPreviewActivity(null)}
          ></div>

          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-[450px] rounded-lg shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col z-50 max-h-[90vh] sm:max-h-[550px]">
            {/* Close button */}
            <button
              onClick={() => setPreviewActivity(null)}
              className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-white z-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Header - Fixed */}
            <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 sticky top-0 z-10">
              <div
                className="overflow-x-auto whitespace-nowrap pb-1 sm:pb-2 scrollbar-none"
                title={previewActivity?.title || ""}
              >
                <h2 className="text-base sm:text-lg font-bold pr-6 text-gray-900 dark:text-white">
                  {previewActivity?.title}
                </h2>
              </div>
              <div className="mt-1 sm:mt-2 flex items-center space-x-2 sm:space-x-3">
                <Badge
                  variant="outline"
                  className={`${
                    previewActivity && getStatusColor(previewActivity.status)
                  } px-1.5 sm:px-2.5 py-0.5 text-xs sm:text-sm font-medium`}
                >
                  {previewActivity?.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-1.5 sm:px-2.5 py-0.5 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-200"
                >
                  {previewActivity?.type}
                </Badge>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div
              className="overflow-y-auto custom-scrollbar"
              style={{
                height: "auto",
                maxHeight: "calc(90vh - 160px)",
                minHeight: "200px",
              }}
            >
              <div className="p-3 sm:p-5 space-y-3 sm:space-y-5">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                    Description
                  </h4>
                  <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-md p-2 sm:p-4">
                    <p className="whitespace-pre-wrap break-words text-xs sm:text-sm text-gray-900 dark:text-zinc-300">
                      {previewActivity?.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                      Due Date
                    </h4>
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800/50 rounded-md p-2 sm:p-3">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 dark:text-zinc-400" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-300">
                        {previewActivity && formatDate(previewActivity.dueDate)}
                      </span>
                    </div>
                  </div>

                  {previewActivity?.completedDate && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                        Completed Date
                      </h4>
                      <div className="flex items-center bg-gray-100 dark:bg-zinc-800/50 rounded-md p-2 sm:p-3">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-green-500 dark:text-green-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-300">
                          {formatDate(previewActivity.completedDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                      Created
                    </h4>
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800/50 rounded-md p-2 sm:p-3">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 dark:text-zinc-400" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-300">
                        {previewActivity &&
                          formatDate(previewActivity.createdAt)}
                      </span>
                    </div>
                  </div>

                  {previewActivity?.type && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                        Activity Type
                      </h4>
                      <div className="flex items-center bg-gray-100 dark:bg-zinc-800/50 rounded-md p-2 sm:p-3">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500 dark:text-zinc-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-300">
                          {previewActivity.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                    Associated Prospect
                  </h4>
                  <div className="bg-gray-100 dark:bg-zinc-800/50 rounded-md p-2 sm:p-3 flex items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-300">
                      ID: {id}
                    </span>
                  </div>
                </div>

                {/* Extra space at bottom for better scrolling */}
                <div className="h-2 sm:h-4"></div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 p-2 sm:p-3 rounded-b-lg flex flex-wrap gap-2 sticky bottom-0 bg-gray-50 dark:bg-zinc-900 z-10">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start">
                {previewActivity?.status !== ActivityStatus.COMPLETED && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (previewActivity) {
                        handleMarkComplete(previewActivity._id);
                        setPreviewActivity(null);
                      }
                    }}
                    className="h-7 text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-green-100 dark:bg-green-900/20 border-green-500 dark:border-green-800 text-green-500 dark:text-green-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (previewActivity) {
                      setDeleteActivityId(previewActivity._id);
                      setPreviewActivity(null);
                    }
                  }}
                  className="h-7 text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-red-100 dark:bg-red-900/20 border-red-500 dark:border-red-800 text-red-500 dark:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end mt-1 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (previewActivity) {
                      handleEditClick(previewActivity);
                      setPreviewActivity(null);
                    }
                  }}
                  className="h-7 text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-200"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPreviewActivity(null)}
                  className="h-7 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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

        /* Make tabs scrollable on mobile */
        @media (max-width: 640px) {
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
          .overflow-x-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
    </div>
  );
}
