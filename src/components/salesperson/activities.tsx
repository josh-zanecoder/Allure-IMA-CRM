"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "@/lib/validation/activity-schema";
import { Loader2 } from "lucide-react";
import { useActivityStore } from "@/store/useActivityStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivitiesModalProps {
  isOpenModal: boolean;
  onOpenChangeModal: (open: boolean) => void;
}

export default function Activities({
  isOpenModal,
  onOpenChangeModal,
}: ActivitiesModalProps) {
  const { activities, isLoading, error, fetchActivities, resetError } =
    useActivityStore();

  useEffect(() => {
    if (isOpenModal) {
      fetchActivities();
    }
  }, [isOpenModal, fetchActivities]);

  // Reset error when dialog closes
  useEffect(() => {
    if (!isOpenModal && error) {
      resetError();
    }
  }, [isOpenModal, error, resetError]);

  // Format the activity date in a readable format
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

  // Check if an activity is due soon (within 24 hours)
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

  // Check if an activity is almost due (within 3 days but not due soon)
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

  // Format content that might be a URL
  const formatUrlContent = (content: string) => {
    if (!content) return "";
    if (content.startsWith("http://") || content.startsWith("https://")) {
      try {
        const url = new URL(content);
        return `Link: ${url.hostname}`;
      } catch {
        return "Link: Website";
      }
    }
    return content;
  };

  // Check if an activity is expired (past due date but still pending)
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

  // Sort activities by status and creation date
  const sortedActivities = [...activities].sort((a, b) => {
    // First sort by status - pending first
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;

    // If same status, sort by creation date (newest first)
    const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });

  return (
    <Dialog open={isOpenModal} onOpenChange={onOpenChangeModal}>
      <DialogContent className="sm:max-w-[675px] max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Activities
          </DialogTitle>
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
        ) : sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities found
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity: Activity) => (
              <div
                key={activity._id}
                className={`border rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-colors ${
                  isExpired(activity.dueDate as string, activity.status)
                    ? "border-2 border-red-500 bg-red-50/10"
                    : isDueSoon(activity.dueDate as string) &&
                      activity.status === "PENDING"
                    ? "border-yellow-400"
                    : isAlmostDue(activity.dueDate as string) &&
                      activity.status === "PENDING"
                    ? "border-yellow-400"
                    : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <h3 className="font-medium text-base sm:text-lg break-all line-clamp-2 flex-1 overflow-hidden text-wrap">
                    {formatUrlContent(activity.title)}
                  </h3>
                  <div className="flex flex-wrap gap-1 shrink-0">
                    {isExpired(activity.dueDate as string, activity.status) && (
                      <Badge
                        variant="destructive"
                        className="whitespace-nowrap bg-red-500 text-[10px] sm:text-xs"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                    {isDueSoon(activity.dueDate as string) &&
                      activity.status === "PENDING" &&
                      !isExpired(
                        activity.dueDate as string,
                        activity.status
                      ) && (
                        <Badge
                          variant="outline"
                          className="whitespace-nowrap border-yellow-400 text-yellow-600 text-[10px] sm:text-xs"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Due Soon
                        </Badge>
                      )}
                    {isAlmostDue(activity.dueDate as string) &&
                      activity.status === "PENDING" && (
                        <Badge
                          variant="outline"
                          className="whitespace-nowrap border-yellow-400 text-yellow-600 text-[10px] sm:text-xs"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Almost Due
                        </Badge>
                      )}
                    <Badge
                      variant={
                        activity.status === "COMPLETED" ? "default" : "outline"
                      }
                      className="whitespace-nowrap text-[10px] sm:text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>

                <div className="w-full overflow-hidden">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-all whitespace-normal text-wrap line-clamp-2">
                    {formatUrlContent(activity.description)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
                  <div className="break-all overflow-hidden text-wrap">
                    <span className="font-medium whitespace-nowrap">
                      Prospect:
                    </span>{" "}
                    {getProspectName(activity.prospectId)}
                  </div>
                  <div className="break-all overflow-hidden text-wrap">
                    <span className="font-medium whitespace-nowrap">Type:</span>{" "}
                    {activity.type}
                  </div>
                  <div className="break-all overflow-hidden text-wrap">
                    <span className="font-medium whitespace-nowrap">
                      Due Date:
                    </span>{" "}
                    {formatDate(activity.dueDate as string)}
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
