"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useReminderStore, Reminder } from "@/store/useReminderStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash,
  Pencil,
  Eye,
  X,
} from "lucide-react";
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
import AddEditReminderModal from "@/components/salesperson/AddEditReminderModal";
import type { Reminder as ModalReminder } from "@/types/reminder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatDate(date: Date | string) {
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    // Format date as "Month Day, Year at h:mm AM/PM"
    return format(parsedDate, "MMMM d, yyyy 'at' h:mm a");
  } catch (error) {
    return "Invalid date";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-500/20 text-amber-500";
    case "completed":
      return "bg-green-500/20 text-green-500";
    case "overdue":
      return "bg-red-500/20 text-red-500";
    default:
      return "bg-zinc-500/20 text-zinc-400";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RemindersPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [viewingReminder, setViewingReminder] = useState<Reminder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Use the reminder store
  const {
    reminders,
    isLoading,
    error,
    fetchReminders,
    addReminder,
    deleteReminder,
    markReminderComplete,
    updateReminder,
  } = useReminderStore();

  // Fetch reminders when the component mounts
  useEffect(() => {
    if (id) {
      fetchReminders(id);
    }
  }, [id, fetchReminders]);

  const handleAddReminder = async (
    reminderData: Omit<Reminder, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    try {
      const result = await addReminder(id, reminderData);
      if (result) {
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to add reminder");
    }
  };

  const handleDeleteReminder = async () => {
    if (!deletingReminderId) return;

    try {
      const success = await deleteReminder(id, deletingReminderId);
      if (success) {
        toast.success("Reminder deleted successfully");
      } else {
        toast.error("Failed to delete reminder");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the reminder");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingReminderId(null);
    }
  };

  const handleMarkComplete = async (reminderId: string) => {
    try {
      const result = await markReminderComplete(id, reminderId);
      if (result) {
        toast.success("Reminder marked as complete");
      }
    } catch (error) {
      toast.error("Failed to update reminder status");
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (
    reminderData: Omit<
      ModalReminder,
      "_id" | "createdAt" | "updatedAt" | "addedBy"
    >
  ) => {
    if (!editingReminder) return;

    try {
      // Map from ReminderStatus enum to store status strings
      let storeStatus: "pending" | "completed" | "overdue";

      // Map status
      switch (reminderData.status) {
        case "SENT":
          storeStatus = "completed";
          break;
        case "CANCELLED":
          storeStatus = "overdue";
          break;
        case "PENDING":
        default:
          storeStatus = "pending";
          break;
      }

      // Create the adapted reminder
      const adaptedReminder = {
        title: reminderData.title,
        description: reminderData.description,
        dueDate: reminderData.dueDate,
        priority: "medium" as const,
        status: storeStatus,
        type: reminderData.type,
      };

      // Call updateReminder from the store
      const result = await updateReminder(
        id,
        editingReminder._id,
        adaptedReminder
      );

      if (result) {
        setIsModalOpen(false);
        setEditingReminder(null);
        setIsEditMode(false);
      }
    } catch (err) {
      toast.error("Failed to update reminder");
    }
  };

  const handleViewReminder = (reminder: Reminder) => {
    setViewingReminder(reminder);
    setIsViewModalOpen(true);
  };

  const filteredReminders =
    activeTab === "all"
      ? reminders
      : reminders.filter((reminder) => reminder.status === activeTab);

  // Update the adapter function to properly map statuses and include type
  const adaptReminderForModal = (
    reminder: Omit<ModalReminder, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    // Map from ReminderStatus enum to store status strings
    let storeStatus: "pending" | "completed" | "overdue";

    // Default to 'pending' if not specified
    switch (reminder.status) {
      case "SENT":
        storeStatus = "completed";
        break;
      case "CANCELLED":
        storeStatus = "overdue";
        break;
      case "PENDING":
      default:
        storeStatus = "pending";
        break;
    }

    // Create the adapted reminder with required store fields
    const adaptedReminder = {
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      priority: "medium" as const, // Required by store
      status: storeStatus,
      type: reminder.type, // Include the type from the modal's form
    };

    // Call the actual handler with properly typed data
    return handleAddReminder(adaptedReminder);
  };

  // Add this function to convert our store's Reminder to the modal's expected format
  const convertStoreReminderToModalFormat = (
    reminder: Reminder | null
  ): Partial<ModalReminder> | undefined => {
    if (!reminder) return undefined;

    // Map from store status to API status
    let modalStatus = "PENDING";
    switch (reminder.status) {
      case "completed":
        modalStatus = "SENT";
        break;
      case "overdue":
        modalStatus = "CANCELLED";
        break;
      case "pending":
      default:
        modalStatus = "PENDING";
        break;
    }

    return {
      _id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      status: modalStatus as any, // Force type compatibility
      type: reminder.type as any, // Force type compatibility
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-gray-200">{error}</p>
          <Button
            onClick={() => fetchReminders(id)}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-4 bg-white dark:bg-zinc-950">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Reminders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage reminders for this prospect
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 -mx-2 px-2">
            <TabsList className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 w-max sm:w-auto mb-2 sm:mb-0 flex-nowrap min-w-full">
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
                value="completed"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
              >
                Overdue
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground ml-auto sm:ml-0">
            {filteredReminders.length} reminder
            {filteredReminders.length !== 1 ? "s" : ""}
          </div>
        </div>

        <TabsContent value={activeTab} className="m-0">
          {filteredReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 sm:p-8 mt-2 sm:mt-4">
              <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-zinc-600 mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-zinc-300">
                No Reminders
              </h3>
              <p className="text-gray-500 dark:text-zinc-500 text-xs sm:text-sm text-center mt-1 max-w-sm">
                {activeTab === "all"
                  ? "You haven't created any reminders yet. Add one to get started."
                  : `No ${activeTab} reminders found.`}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="mt-3 sm:mt-4 text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Reminder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2 sm:mt-4">
              {filteredReminders.map((reminder) => (
                <Card
                  key={reminder._id}
                  className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors overflow-hidden"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-800 flex-1 bg-gray-50/50 dark:bg-zinc-900/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="mr-2 flex-1">
                          <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-zinc-200 truncate max-w-[200px]">
                            {reminder.title}
                          </h3>
                        </div>
                        <div
                          className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            reminder.status
                          )} flex-shrink-0 whitespace-nowrap`}
                        >
                          {reminder.status}
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
                        {reminder.description}
                      </p>

                      <div className="flex items-center gap-1 sm:gap-2 mt-auto text-xs sm:text-sm">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 dark:text-zinc-500" />
                        <span className="text-gray-700 dark:text-zinc-300 truncate">
                          {formatDate(reminder.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-zinc-800 p-1.5 sm:p-2 flex justify-end gap-1 sm:gap-1.5 bg-white/80 dark:bg-zinc-950/80">
                      <button
                        onClick={() => handleViewReminder(reminder)}
                        className="p-1 sm:p-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      {reminder.status !== "completed" && (
                        <button
                          onClick={() => handleMarkComplete(reminder._id)}
                          className="p-1 sm:p-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditReminder(reminder)}
                        className="p-1 sm:p-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
                        title="Edit Reminder"
                      >
                        <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingReminderId(reminder._id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1 sm:p-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-red-200 dark:hover:bg-red-800/60 text-gray-500 dark:text-zinc-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Delete Reminder"
                      >
                        <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddEditReminderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReminder(null);
          setIsEditMode(false);
        }}
        onSave={isEditMode ? handleSaveEdit : adaptReminderForModal}
        prospectId={id}
        mode={isEditMode ? "edit" : "add"}
        initialData={convertStoreReminderToModalFormat(editingReminder)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reminder? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReminder}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
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

      <Dialog open={false} onOpenChange={() => {}}>
        {/* Empty Dialog kept for consistency in case there are dependencies */}
      </Dialog>

      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div
            className="fixed inset-0 bg-gray-500/80 dark:bg-black/80"
            onClick={() => setIsViewModalOpen(false)}
          ></div>

          <div className="relative bg-white dark:bg-zinc-950 w-full max-w-[450px] rounded-lg shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col z-50 max-h-[90vh] sm:max-h-[550px]">
            {/* Close button */}
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-white z-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Header - Fixed */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 sticky top-0 z-10">
              <div
                className="overflow-x-auto whitespace-nowrap pb-1 scrollbar-none"
                title={viewingReminder?.title || ""}
              >
                <h2 className="text-sm sm:text-base font-bold pr-6 text-gray-900 dark:text-white">
                  {viewingReminder?.title}
                </h2>
              </div>
              <div className="mt-1 sm:mt-1.5 flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`${
                    viewingReminder?.status &&
                    getStatusColor(viewingReminder.status)
                  } px-1.5 sm:px-2 py-0.5 text-xs font-medium`}
                >
                  {viewingReminder?.status}
                </Badge>
                {viewingReminder?.type && (
                  <Badge
                    variant="secondary"
                    className="px-1.5 sm:px-2 py-0.5 text-xs font-medium"
                  >
                    {viewingReminder.type}
                  </Badge>
                )}
              </div>
            </div>

            {/* Body - Scrollable */}
            <div
              className="overflow-y-auto"
              style={{
                height: "auto",
                maxHeight: "calc(90vh - 160px)",
                minHeight: "200px",
              }}
            >
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                    Description
                  </h4>
                  <div className="bg-gray-200/50 dark:bg-zinc-800/50 rounded-md p-2 sm:p-3">
                    <p className="whitespace-pre-wrap break-words text-xs text-gray-700 dark:text-zinc-300">
                      {viewingReminder?.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                      Due Date & Time
                    </h4>
                    <div className="flex items-center bg-gray-200/50 dark:bg-zinc-800/50 rounded-md p-2">
                      <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 text-gray-400 dark:text-zinc-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                        {viewingReminder && formatDate(viewingReminder.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                      Created
                    </h4>
                    <div className="flex items-center bg-gray-200/50 dark:bg-zinc-800/50 rounded-md p-2">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 text-gray-400 dark:text-zinc-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                        {viewingReminder && viewingReminder.createdAt
                          ? formatDate(viewingReminder.createdAt)
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wide mb-1 sm:mb-2">
                    Associated Prospect
                  </h4>
                  <div className="bg-gray-200/50 dark:bg-zinc-800/50 rounded-md p-2 flex items-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                      ID: {id}
                    </span>
                  </div>
                </div>

                {/* Extra space at bottom for better scrolling */}
                <div className="h-2 sm:h-4"></div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-gray-200 dark:border-zinc-800 bg-gray-200/30 dark:bg-zinc-800/30 p-2 sm:p-3 rounded-b-lg flex flex-wrap gap-2 sticky bottom-0 bg-gray-50 dark:bg-zinc-900 z-10">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start">
                {viewingReminder?.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (viewingReminder) {
                        handleMarkComplete(viewingReminder._id);
                        setIsViewModalOpen(false);
                      }
                    }}
                    className="h-7 text-xs flex items-center gap-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-green-200 dark:hover:bg-green-900/20 border-green-800 text-green-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewingReminder) {
                      setDeletingReminderId(viewingReminder._id);
                      setIsViewModalOpen(false);
                      setDeleteDialogOpen(true);
                    }
                  }}
                  className="h-7 text-xs flex items-center gap-1.5 bg-gray-200 dark:bg-zinc-800 hover:bg-red-200 dark:hover:bg-red-900/20 border-red-800 text-red-400"
                >
                  <Trash className="h-3 w-3" />
                  Delete
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end mt-1 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewingReminder) {
                      setIsViewModalOpen(false);
                      handleEditReminder(viewingReminder);
                    }
                  }}
                  className="h-7 text-xs flex items-center gap-1.5"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
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
