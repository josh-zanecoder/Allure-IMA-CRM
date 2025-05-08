"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reminder } from "@/lib/validation/reminder-schema";
import { Loader2, AlertCircle } from "lucide-react";
import { useReminderStore } from "@/store/useReminderStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RemindersModalProps {
  isOpenModal: boolean;
  onOpenChangeModal: (open: boolean) => void;
}

export default function Reminders({
  isOpenModal,
  onOpenChangeModal,
}: RemindersModalProps) {
  const { reminders, isLoading, error, fetchReminders } = useReminderStore();

  useEffect(() => {
    if (isOpenModal) {
      fetchReminders("all");
    }
  }, [isOpenModal, fetchReminders]);

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

  // Sort reminders by date
  const sortedReminders = [...reminders].sort((a, b) => {
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
            {sortedReminders.map((reminder) => (
              <div
                key={reminder._id}
                className="border rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-semibold text-base break-words">
                      {reminder.title}
                    </h3>
                    <Badge className="shrink-0 capitalize">
                      {reminder.status.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="bg-secondary/20 rounded-md p-3 mb-3">
                    <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                      {reminder.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Type:</span> {reminder.type}
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span>{" "}
                      {formatDate(reminder.dueDate)}
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium">Prospect:</span>{" "}
                      {reminder.addedBy
                        ? `${reminder.addedBy.firstName} ${reminder.addedBy.lastName}`
                        : "Unknown"}
                    </div>
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
