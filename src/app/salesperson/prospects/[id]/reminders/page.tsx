"use client";

import React, { useState, useEffect } from "react";
import { Reminder, ReminderStatus } from "@/types/reminder";
import AddEditReminderModal from "@/components/salesperson/AddEditReminderModal";
import {
  Bell,
  Clock,
  CheckCircle2,
  Trash2,
  Pencil,
  AlertCircle,
  Loader2,
  Plus,
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

function getStatusVariant(status: ReminderStatus) {
  switch (status) {
    case ReminderStatus.SENT:
      return "default";
    case ReminderStatus.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusColor(status: ReminderStatus): string {
  switch (status) {
    case ReminderStatus.SENT:
      return "bg-green-500/20 text-green-300";
    case ReminderStatus.CANCELLED:
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-blue-500/20 text-blue-300";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RemindersPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewReminder, setPreviewReminder] = useState<Reminder | null>(null);

  const fetchReminders = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/prospects/${id}/reminders`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reminders");
      }
      const remindersData = await response.json();
      setReminders(remindersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load reminders");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReminders();
    }
  }, [id, fetchReminders]);

  const handleAddReminder = async (
    reminder: Omit<Reminder, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    try {
      const response = await fetch(`/api/prospects/${id}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reminder,
          dueDate: reminder.dueDate.toISOString(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add reminder");
      }
      setIsModalOpen(false);
      await fetchReminders();
    } catch (err) {
      console.error("Error adding reminder:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add reminder"
      );
    }
  };

  const handleDeleteClick = (reminderId: string) => {
    setDeleteReminderId(reminderId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReminderId) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting reminder...");

    try {
      const response = await fetch(
        `/api/prospects/${id}/reminders/${deleteReminderId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete reminder");
      }

      setReminders((prevReminders) =>
        prevReminders.filter((reminder) => reminder._id !== deleteReminderId)
      );
      toast.success("Reminder removed successfully", {
        id: loadingToast,
      });
    } catch (err) {
      console.error("Error deleting reminder:", err);
      toast.error("Failed to delete reminder", {
        id: loadingToast,
      });
      fetchReminders();
    } finally {
      setIsDeleting(false);
      setDeleteReminderId(null);
    }
  };

  const handleEditClick = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditModalOpen(true);
  };

  const handleEditReminder = async (
    reminder: Omit<Reminder, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    if (!editingReminder) return;
    try {
      const response = await fetch(
        `/api/prospects/${id}/reminders/${editingReminder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...reminder,
            dueDate: reminder.dueDate.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update reminder");
      }

      setIsEditModalOpen(false);
      setEditingReminder(null);
      await fetchReminders();
    } catch (err) {
      console.error("Error updating reminder:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update reminder"
      );
    }
  };

  const openPreviewModal = (reminder: Reminder) => {
    setPreviewReminder(reminder);
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
        <AlertTitle>Error Loading Reminders</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReminders}
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
            <Bell className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Reminders</h1>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="rounded-full gap-1.5 font-medium px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-zinc-800 p-4 rounded-full mb-4">
            <Bell className="h-10 w-10 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No reminders yet</h3>
          <p className="mb-6 text-sm text-center text-zinc-400 max-w-md">
            Stay organized by adding reminders for this prospect.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Add First Reminder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reminders.map((reminder) => (
            <div
              key={reminder._id}
              className="relative bg-zinc-900 rounded-xl overflow-hidden ring-1 ring-zinc-800 hover:ring-zinc-700 transition-all duration-200 max-h-[200px] flex flex-col"
            >
              {/* Status Bar at Top */}
              <div
                className={`h-1.5 w-full ${
                  getStatusColor(reminder.status).split(" ")[0]
                }`}
              ></div>

              {/* Header with Title and Status */}
              <div className="p-3 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium text-zinc-100 overflow-hidden text-ellipsis break-words min-h-[3rem] max-h-[3rem] line-clamp-2">
                    {reminder.title}
                  </h3>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                      reminder.status
                    )} flex-shrink-0 whitespace-nowrap mt-0.5`}
                  >
                    {reminder.status}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-3 pt-1 pb-2 flex-1 flex flex-col">
                <p className="text-sm text-zinc-300 mb-3 overflow-hidden text-ellipsis break-words min-h-[2.75rem] max-h-[2.75rem] line-clamp-2 leading-relaxed">
                  {reminder.description || "No description provided."}
                </p>

                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center text-xs">
                    <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-zinc-500" />
                    <span className="truncate text-zinc-400 font-medium">
                      {formatDate(reminder.dueDate)}
                    </span>
                  </div>

                  {reminder.completedAt && (
                    <div className="flex items-center text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-green-400" />
                      <span className="truncate text-zinc-400 font-medium">
                        {formatDate(reminder.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-800 p-2 flex justify-end gap-1.5 bg-zinc-900/80">
                <button
                  onClick={() => openPreviewModal(reminder)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleEditClick(reminder)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(reminder._id)}
                  className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-800/60 text-zinc-500 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddReminder}
        prospectId={id}
      />

      <AddEditReminderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleEditReminder}
        prospectId={id}
        initialData={editingReminder || undefined}
        mode="edit"
      />

      <AlertDialog
        open={!!deleteReminderId}
        onOpenChange={() => setDeleteReminderId(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              reminder.
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

      {/* Reminder Preview Modal */}
      <Dialog
        open={!!previewReminder}
        onOpenChange={(open) => !open && setPreviewReminder(null)}
      >
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col bg-zinc-900 border-zinc-800">
          <DialogHeader className="border-b border-zinc-800 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-xl font-semibold text-zinc-100 overflow-hidden text-ellipsis line-clamp-2 break-words mr-2">
                {previewReminder?.title}
              </DialogTitle>
              <div
                className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                  previewReminder && getStatusColor(previewReminder.status)
                } flex-shrink-0 whitespace-nowrap`}
              >
                {previewReminder?.status}
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
                    {previewReminder?.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300">
                    Due:{" "}
                    {previewReminder && formatDate(previewReminder.dueDate)}
                  </span>
                </div>

                {previewReminder?.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-zinc-300">
                      Completed: {formatDate(previewReminder.completedAt)}
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
                if (previewReminder) {
                  handleEditClick(previewReminder);
                  setPreviewReminder(null);
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
