"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reminder } from "@/lib/validation/reminder-schema";
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useReminderStore } from "@/store/useReminderStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface RemindersModalProps {
  isOpenModal: boolean;
  onOpenChangeModal: (open: boolean) => void;
}

// Custom type for API response reminders that has a different structure than our Reminder type
interface ApiReminderResponse {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  completedAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addedBy:
    | string
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
  prospectId: string;
  prospect?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  priority?: "low" | "medium" | "high";
}

export default function Reminders({
  isOpenModal,
  onOpenChangeModal,
}: RemindersModalProps) {
  const { reminders, isLoading, error, fetchReminders } = useReminderStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [allReminders, setAllReminders] = useState<ApiReminderResponse[]>([]);

  // Fetch reminders from the general API endpoint instead of prospect-specific one
  const fetchAllReminders = async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);

      // Use a different endpoint that supports listing all reminders
      const response = await axios.get("/api/reminders");

      // Map API response statuses to our store's format
      const mappedReminders = response.data.map((reminder: any) => {
        // Convert API status to our store format
        let storeStatus: string;
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

        return {
          ...reminder,
          status: storeStatus,
          priority: "medium", // Default priority
          dueDate: reminder.dueDate, // Keep as string for now
        };
      });

      setAllReminders(mappedReminders);
      setLocalLoading(false);
    } catch (error) {
      console.error("Error fetching all reminders:", error);
      let errorMessage = "Failed to load reminders";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setLocalError(errorMessage);
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (isOpenModal) {
      // Check if we need all reminders or specific prospect reminders
      fetchAllReminders();
    }
  }, [isOpenModal]);

  // Format the reminder date in a readable format
  const formatDate = (dateInput: Date | string) => {
    if (!dateInput) return "";
    try {
      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return date.toLocaleString();
    } catch (e) {
      return typeof dateInput === "string" ? dateInput : dateInput.toString();
    }
  };

  // Get prospect name from prospect reference
  const getProspectName = (prospect: any) => {
    if (!prospect) return "Unknown Prospect";
    if (typeof prospect === "string")
      return "ID: " + prospect.substring(0, 6) + "...";
    return (
      `${prospect.firstName || ""} ${prospect.lastName || ""}`.trim() ||
      "Unknown Prospect"
    );
  };

  // Get user name from addedBy reference
  const getUserName = (addedBy: any) => {
    if (!addedBy) return "Unknown User";
    if (typeof addedBy === "string")
      return "ID: " + addedBy.substring(0, 6) + "...";
    return (
      `${addedBy.firstName || ""} ${addedBy.lastName || ""}`.trim() ||
      "Unknown User"
    );
  };

  // Check if a reminder is due soon (within 24 hours)
  const isDueSoon = (dueDate: string, status: string) => {
    if (!dueDate || status !== "pending") return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      return diff > 0 && diff < 24 * 60 * 60 * 1000; // less than 24 hours from now
    } catch (e) {
      return false;
    }
  };

  // Check if a reminder is almost due (within 3 days but not due soon)
  const isAlmostDue = (dueDate: string, status: string) => {
    if (!dueDate || status !== "pending") return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      return (
        diff > 0 &&
        diff < 3 * 24 * 60 * 60 * 1000 &&
        !isDueSoon(dueDate, status)
      ); // within 3 days but not due soon
    } catch (e) {
      return false;
    }
  };

  // Check if a reminder is expired (past due date but still pending)
  const isExpired = (dueDate: string, status: string) => {
    if (!dueDate || status !== "pending") return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      return due < now; // Due date is in the past
    } catch (e) {
      return false;
    }
  };

  // Get a numerical priority value for sorting
  const getReminderPriority = (reminder: ApiReminderResponse): number => {
    const status =
      typeof reminder.status === "string"
        ? reminder.status.toLowerCase()
        : "pending";

    // Almost due reminders have highest priority (lowest sort value)
    if (isDueSoon(reminder.dueDate, status)) return 1;

    // Then come almost due reminders
    if (isAlmostDue(reminder.dueDate, status)) return 2;

    // Regular pending reminders
    if (status === "pending" && !isExpired(reminder.dueDate, status)) return 3;

    // Completed reminders
    if (status === "completed") return 4;

    // Expired reminders have lowest priority (highest sort value)
    if (isExpired(reminder.dueDate, status)) return 5;

    // Everything else
    return 6;
  };

  // Sort reminders by priority and then date
  const displayReminders = [...allReminders].sort((a, b) => {
    // First sort by our priority logic
    const priorityA = getReminderPriority(a);
    const priorityB = getReminderPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority category, sort by date
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dateA - dateB;
  });

  const isLoadingReminders = isLoading || localLoading;
  const displayError = error || localError;

  return (
    <Dialog open={isOpenModal} onOpenChange={onOpenChangeModal}>
      <DialogContent className="w-[95vw] sm:w-[95vw] max-w-[675px] max-h-[85vh] overflow-hidden p-3 sm:p-6">
        <DialogHeader className="mb-2 sm:mb-4">
          <DialogTitle className="text-base sm:text-xl font-semibold">
            Reminders
          </DialogTitle>
        </DialogHeader>

        {displayError && (
          <Alert
            variant="destructive"
            className="mb-2 sm:mb-4 text-xs sm:text-sm"
          >
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {isLoadingReminders ? (
          <div className="flex justify-center items-center py-6 sm:py-12">
            <Loader2 className="w-5 h-5 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : displayReminders.length === 0 ? (
          <div className="text-center py-4 sm:py-8 text-muted-foreground text-xs sm:text-base">
            No reminders found
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4 overflow-y-auto pr-1 max-h-[calc(85vh-8rem)] sm:max-h-[calc(85vh-10rem)]">
            {displayReminders.map((reminder) => {
              const status =
                typeof reminder.status === "string"
                  ? reminder.status.toLowerCase()
                  : "pending";
              const isExpiredReminder = isExpired(reminder.dueDate, status);
              const isDueSoonReminder = isDueSoon(reminder.dueDate, status);
              const isAlmostDueReminder = isAlmostDue(reminder.dueDate, status);

              return (
                <div
                  key={reminder._id}
                  className={`border rounded-lg shadow-sm hover:shadow-md transition-all
                    ${
                      isExpiredReminder
                        ? "border-2 border-red-500 bg-red-50/10"
                        : ""
                    }
                    ${isDueSoonReminder ? "border-2 border-yellow-500" : ""}
                    ${isAlmostDueReminder ? "border-yellow-400" : ""}
                    ${
                      status === "completed"
                        ? "border-green-400 bg-green-50/10"
                        : ""
                    }
                  `}
                >
                  <div className="p-2 sm:p-4">
                    <div className="flex flex-col gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                      <div className="flex justify-between items-start gap-1 sm:gap-2">
                        <h3 className="font-medium text-xs sm:text-base break-words line-clamp-2">
                          {reminder.title}
                        </h3>
                        <Badge
                          className={`shrink-0 capitalize text-[10px] sm:text-xs ${
                            status === "completed"
                              ? "bg-green-500"
                              : status === "overdue"
                              ? "bg-red-400"
                              : ""
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                          ) : null}
                          {status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {isExpiredReminder && (
                          <Badge
                            variant="destructive"
                            className="whitespace-nowrap bg-red-500 text-[10px] sm:text-xs"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />{" "}
                            Expired
                          </Badge>
                        )}
                        {isDueSoonReminder && (
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap border-yellow-500 text-yellow-600 text-[10px] sm:text-xs"
                          >
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />{" "}
                            Due Soon
                          </Badge>
                        )}
                        {isAlmostDueReminder && (
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap border-yellow-400 text-yellow-600 text-[10px] sm:text-xs"
                          >
                            <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />{" "}
                            Almost Due
                          </Badge>
                        )}
                      </div>
                    </div>

                    {reminder.description && (
                      <div className="bg-secondary/20 rounded-md p-1.5 sm:p-3 mb-1.5 sm:mb-3">
                        <p className="text-[10px] sm:text-sm text-muted-foreground break-words whitespace-pre-wrap max-h-16 sm:max-h-24 overflow-y-auto">
                          {reminder.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 sm:gap-1.5 text-[9px] sm:text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {reminder.type}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>{" "}
                        <span className="line-clamp-1">
                          {formatDate(reminder.dueDate)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Added By:</span>{" "}
                        <span className="line-clamp-1">
                          {getUserName(reminder.addedBy)}
                        </span>
                      </div>
                      {reminder.prospectId && (
                        <div className="col-span-2">
                          <span className="font-medium">Prospect:</span>{" "}
                          <span className="line-clamp-1">
                            {getProspectName(
                              reminder.prospect || reminder.prospectId
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
