"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reminder } from "@/lib/validation/reminder-schema";
import { Loader2 } from "lucide-react";
import { useReminderStore } from "@/store/reminderStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RemindersModalProps {
  isOpenModal: boolean;
  onOpenChangeModal: (open: boolean) => void;
}

export default function Reminders({
  isOpenModal,
  onOpenChangeModal,
}: RemindersModalProps) {
  const { reminders, isLoading, error, fetchReminders, resetError } =
    useReminderStore();

  useEffect(() => {
    if (isOpenModal) {
      fetchReminders();
    }
  }, [isOpenModal, fetchReminders]);

  // Reset error when dialog closes
  useEffect(() => {
    if (!isOpenModal && error) {
      resetError();
    }
  }, [isOpenModal, error, resetError]);

  // Format the reminder date in a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString || "";
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

  // Check if a reminder is due soon (within 24 hours)
  const isDueSoon = (dueDate: string) => {
    if (!dueDate) return false;
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
  const isAlmostDue = (dueDate: string) => {
    if (!dueDate) return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 && !isDueSoon(dueDate); // within 3 days but not due soon
    } catch (e) {
      return false;
    }
  };

  // Check if a reminder is expired (past due date but still pending)
  const isExpired = (dueDate: string, status: string) => {
    if (!dueDate || status !== "PENDING") return false;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      return due < now; // Due date is in the past
    } catch (e) {
      return false;
    }
  };

  // Sort reminders by due date and status
  const sortedReminders = [...reminders].sort((a, b) => {
    // First sort by status - pending first
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;

    // Then sort by due date (ascending)
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <Dialog open={isOpenModal} onOpenChange={onOpenChangeModal}>
      <DialogContent className="sm:max-w-[675px] max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Reminders</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reminders found
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReminders.map((reminder: Reminder) => (
              <div
                key={reminder._id}
                className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors ${
                  isExpired(reminder.dueDate, reminder.status)
                    ? "border-2 border-red-500 bg-red-50/10"
                    : isDueSoon(reminder.dueDate) &&
                      reminder.status === "PENDING"
                    ? "border-red-400"
                    : isAlmostDue(reminder.dueDate) &&
                      reminder.status === "PENDING"
                    ? "border-yellow-400"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-medium text-lg break-words line-clamp-2 flex-1">
                    {reminder.title}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    {isExpired(reminder.dueDate, reminder.status) && (
                      <Badge
                        variant="destructive"
                        className="whitespace-nowrap bg-red-500"
                      >
                        Expired
                      </Badge>
                    )}
                    {isDueSoon(reminder.dueDate) &&
                      reminder.status === "PENDING" &&
                      !isExpired(reminder.dueDate, reminder.status) && (
                        <Badge
                          variant="destructive"
                          className="whitespace-nowrap"
                        >
                          Due Soon
                        </Badge>
                      )}
                    {isAlmostDue(reminder.dueDate) &&
                      reminder.status === "PENDING" && (
                        <Badge
                          variant="outline"
                          className="whitespace-nowrap border-yellow-400 text-yellow-600"
                        >
                          Almost Due
                        </Badge>
                      )}
                    <Badge
                      variant={
                        reminder.status === "COMPLETED" ? "default" : "outline"
                      }
                    >
                      {reminder.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-2 break-words whitespace-normal">
                  {reminder.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="break-words">
                    <span className="font-medium">Prospect:</span>{" "}
                    {getProspectName(reminder.prospectId)}
                  </div>
                  <div className="break-words">
                    <span className="font-medium">Type:</span> {reminder.type}
                  </div>
                  <div className="whitespace-normal">
                    <span className="font-medium">Due Date:</span>{" "}
                    {formatDate(reminder.dueDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
