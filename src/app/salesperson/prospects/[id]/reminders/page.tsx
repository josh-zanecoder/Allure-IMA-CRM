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
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Manage reminders for this prospect
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
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
        <div className="flex justify-between items-center">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Completed
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-sm">
              Overdue
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {filteredReminders.length} reminder
            {filteredReminders.length !== 1 ? "s" : ""}
          </div>
        </div>

        <TabsContent value={activeTab} className="m-0">
          {filteredReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 mt-4">
              <CalendarIcon className="h-12 w-12 text-zinc-600 mb-3" />
              <h3 className="text-lg font-medium text-zinc-300">
                No Reminders
              </h3>
              <p className="text-zinc-500 text-center mt-1 max-w-sm">
                {activeTab === "all"
                  ? "You haven't created any reminders yet. Add one to get started."
                  : `No ${activeTab} reminders found.`}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredReminders.map((reminder) => (
                <Card
                  key={reminder._id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-4 border-b border-zinc-800 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="mr-2 flex-1">
                          <h3 className="font-medium text-zinc-200 truncate max-w-[200px]">
                            {reminder.title}
                          </h3>
                        </div>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            reminder.status
                          )} flex-shrink-0 whitespace-nowrap`}
                        >
                          {reminder.status}
                        </div>
                      </div>

                      <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                        {reminder.description}
                      </p>

                      <div className="flex items-center gap-2 mt-auto text-sm">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-zinc-300">
                          {formatDate(reminder.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 p-2 flex justify-end gap-1.5 bg-zinc-900/80">
                      <button
                        onClick={() => handleViewReminder(reminder)}
                        className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {reminder.status !== "completed" && (
                        <button
                          onClick={() => handleMarkComplete(reminder._id)}
                          className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="Mark as Complete"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditReminder(reminder)}
                        className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Edit Reminder"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingReminderId(reminder._id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-800/60 text-zinc-500 hover:text-red-300 transition-colors"
                        title="Delete Reminder"
                      >
                        <Trash className="h-3.5 w-3.5" />
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
        <AlertDialogContent className="sm:max-w-[425px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setIsViewModalOpen(false)}
          ></div>

          <div className="relative bg-zinc-900 w-[450px] rounded-lg shadow-xl border border-zinc-800 flex flex-col z-50 max-h-[550px]">
            {/* Close button */}
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute right-3 top-3 text-zinc-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header - Fixed */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
              <div
                className="overflow-x-auto whitespace-nowrap pb-1 scrollbar-none"
                title={viewingReminder?.title || ""}
              >
                <h2 className="text-base font-bold pr-6 text-white">
                  {viewingReminder?.title}
                </h2>
              </div>
              <div className="mt-1.5 flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`${
                    viewingReminder?.status &&
                    getStatusColor(viewingReminder.status)
                  } px-2 py-0.5 text-xs font-medium`}
                >
                  {viewingReminder?.status}
                </Badge>
                {viewingReminder?.type && (
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-xs font-medium"
                  >
                    {viewingReminder.type}
                  </Badge>
                )}
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto" style={{ height: "300px" }}>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                    Description
                  </h4>
                  <div className="bg-zinc-800/50 rounded-md p-3">
                    <p className="whitespace-pre-wrap break-words text-xs text-zinc-300">
                      {viewingReminder?.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                      Due Date & Time
                    </h4>
                    <div className="flex items-center bg-zinc-800/50 rounded-md p-2">
                      <CalendarIcon className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">
                        {viewingReminder && formatDate(viewingReminder.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                      Created
                    </h4>
                    <div className="flex items-center bg-zinc-800/50 rounded-md p-2">
                      <Clock className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">
                        {viewingReminder && viewingReminder.createdAt
                          ? formatDate(viewingReminder.createdAt)
                          : "Not available"}
                      </span>
                    </div>
                  </div>
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
                    if (viewingReminder) {
                      setDeletingReminderId(viewingReminder._id);
                      setIsViewModalOpen(false);
                      setDeleteDialogOpen(true);
                    }
                  }}
                  className="h-7 text-xs flex items-center gap-1.5 bg-zinc-800 hover:bg-red-900/20 border-red-800 text-red-400"
                >
                  <Trash className="h-3 w-3" />
                  Delete
                </Button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
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
      `}</style>
    </div>
  );
}
