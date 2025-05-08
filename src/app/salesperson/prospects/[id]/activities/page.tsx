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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="bg-zinc-900 border-zinc-800 overflow-hidden min-h-[220px]"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-5 border-b border-zinc-800 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="mr-2 flex-1">
                      <Skeleton className="h-6 w-40 mb-1" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="mt-auto">
                    <Skeleton className="h-5 w-32 mb-2" />
                  </div>
                </div>
                <div className="border-t border-zinc-800 p-3 flex justify-end gap-2 bg-zinc-900/80">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
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
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Activities</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage activities for this prospect
            </p>
          </div>
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

      <Tabs
        defaultValue="all"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">
              Pending
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="text-sm">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-sm">
              Cancelled
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {filteredActivities.length}{" "}
            {filteredActivities.length === 1 ? "activity" : "activities"}
          </div>
        </div>

        <TabsContent value={activeTab} className="m-0">
          {filteredActivities.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-zinc-800 p-4 rounded-full mb-4">
                <Calendar className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No activities found</h3>
              <p className="mb-6 text-sm text-center text-zinc-400 max-w-md">
                {activeTab === "all"
                  ? "You haven't created any activities yet. Add one to get started."
                  : `No ${activeTab
                      .toLowerCase()
                      .replace("_", " ")} activities found.`}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-full gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredActivities.map((activity) => (
                <Card
                  key={activity._id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="px-5 pb-5 border-b border-zinc-800 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="mr-2 flex-1">
                          <h3 className="font-medium text-zinc-200 text-base truncate max-w-[240px]">
                            {activity.title}
                          </h3>
                        </div>
                        <div
                          className={`px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            activity.status
                          )} flex-shrink-0 whitespace-nowrap`}
                        >
                          {activity.status}
                        </div>
                      </div>

                      <p className="text-zinc-400 text-sm line-clamp-3 mb-4 min-h-[3rem]">
                        {activity.description || "No description provided."}
                      </p>

                      <div className="mt-auto space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-zinc-500" />
                          <span className="truncate text-zinc-300 font-medium">
                            {formatDate(activity.dueDate)}
                          </span>
                        </div>

                        {activity.completedDate && (
                          <div className="flex items-center text-sm">
                            <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 text-green-400" />
                            <span className="truncate text-zinc-300 font-medium">
                              {formatDate(activity.completedDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 px-3 pt-3 flex justify-end gap-2 bg-zinc-900/80">
                      <button
                        onClick={() => openPreviewModal(activity)}
                        className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {activity.status !== ActivityStatus.COMPLETED && (
                        <button
                          onClick={() => handleMarkComplete(activity._id)}
                          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(activity)}
                        className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Edit Activity"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(activity._id)}
                        className="p-2 rounded-full bg-zinc-800 hover:bg-red-800/60 text-zinc-500 hover:text-red-300 transition-colors"
                        title="Delete Activity"
                      >
                        <Trash2 className="h-4 w-4" />
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
      {previewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setPreviewActivity(null)}
          ></div>

          <div className="relative bg-zinc-900 w-[450px] rounded-lg shadow-xl border border-zinc-800 flex flex-col z-50 max-h-[550px]">
            {/* Close button */}
            <button
              onClick={() => setPreviewActivity(null)}
              className="absolute right-3 top-3 text-zinc-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header - Fixed */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
              <div
                className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-none"
                title={previewActivity?.title || ""}
              >
                <h2 className="text-lg font-bold pr-6 text-white">
                  {previewActivity?.title}
                </h2>
              </div>
              <div className="mt-2 flex items-center space-x-3">
                <Badge
                  variant="outline"
                  className={`${
                    previewActivity && getStatusColor(previewActivity.status)
                  } px-2.5 py-0.5 text-sm font-medium`}
                >
                  {previewActivity?.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-2.5 py-0.5 text-sm font-medium"
                >
                  {previewActivity?.type}
                </Badge>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div
              className="overflow-y-auto custom-scrollbar"
              style={{ height: "300px" }}
            >
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                    Description
                  </h4>
                  <div className="bg-zinc-800/50 rounded-md p-4">
                    <p className="whitespace-pre-wrap break-words text-sm text-zinc-300">
                      {previewActivity?.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                      Due Date
                    </h4>
                    <div className="flex items-center bg-zinc-800/50 rounded-md p-3">
                      <Clock className="h-4 w-4 mr-2 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-300">
                        {previewActivity && formatDate(previewActivity.dueDate)}
                      </span>
                    </div>
                  </div>

                  {previewActivity?.completedDate && (
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Completed Date
                      </h4>
                      <div className="flex items-center bg-zinc-800/50 rounded-md p-2">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-300">
                          {formatDate(previewActivity.completedDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                      Created
                    </h4>
                    <div className="flex items-center bg-zinc-800/50 rounded-md p-2">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">
                        {previewActivity &&
                          formatDate(previewActivity.createdAt)}
                      </span>
                    </div>
                  </div>

                  {previewActivity?.type && (
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                        Activity Type
                      </h4>
                      <div className="flex items-center bg-zinc-800/50 rounded-md p-2">
                        <FileText className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-300">
                          {previewActivity.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                    Associated Prospect
                  </h4>
                  <div className="bg-zinc-800/50 rounded-md p-2 flex items-center">
                    <span className="text-xs font-medium text-zinc-300">
                      ID: {id}
                    </span>
                  </div>
                </div>

                {/* Extra space at bottom for better scrolling */}
                <div className="h-4"></div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-zinc-800 bg-zinc-800/30 p-3 rounded-b-lg flex flex-col sm:flex-row gap-2 sticky bottom-0 bg-zinc-900 z-10">
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
                    className="h-7 text-xs flex items-center gap-1.5 bg-zinc-800 hover:bg-green-900/20 border-green-800 text-green-400"
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
                  className="h-7 text-xs flex items-center gap-1.5 bg-zinc-800 hover:bg-red-900/20 border-red-800 text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (previewActivity) {
                      handleEditClick(previewActivity);
                      setPreviewActivity(null);
                    }
                  }}
                  className="h-7 text-xs flex items-center gap-1.5"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPreviewActivity(null)}
                  className="h-7 text-xs"
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
      `}</style>
    </div>
  );
}
