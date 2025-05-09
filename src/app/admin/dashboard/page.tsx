"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  Plus,
  Clock,
  FileText,
  UserRound,
  Calendar,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useCallLogStore } from "@/store/useCallLogStore";
import { Button } from "@/components/ui/button";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Email":
      return (
        <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground" />
      );
    case "Meeting":
      return (
        <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground" />
      );
    case "Task":
      return (
        <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground" />
      );
    default:
      return (
        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground" />
      );
  }
};

const getCallDirectionIcon = (from: string, to: string) => {
  // Simplified logic - could be enhanced based on your business rules
  const isOutgoing = from.startsWith("+112"); // Assuming this is the company prefix

  if (isOutgoing) {
    return (
      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground" />
    );
  } else {
    return (
      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary-foreground rotate-180" />
    );
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
    case "completed":
      return "bg-emerald-500 text-white dark:text-black";
    case "In Progress":
    case "in_progress":
      return "bg-amber-500 text-white dark:text-black";
    case "Cancelled":
    case "cancelled":
      return "bg-destructive text-white dark:text-black";
    case "initiated":
      return "bg-blue-500 text-white dark:text-black";
    case "failed":
      return "bg-red-500 text-white dark:text-black";
    default:
      return "bg-primary text-white dark:text-black";
  }
};

const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) return "Unknown";

  // Format phone number: +11234567890 -> +1 (123) 456-7890
  const match = phoneNumber.match(/^\+(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }

  return phoneNumber;
};

const ITEMS_PER_PAGE = 5;

// Extract skeleton item component to reduce duplication
const SkeletonItem = ({ isLast = false }: { isLast?: boolean }) => (
  <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
    <div className="relative">
      <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full" />
      {!isLast && (
        <div className="absolute left-[11px] sm:left-[13px] md:left-[15px] top-6 sm:top-7 md:top-8 h-[calc(100%+24px)] sm:h-[calc(100%+28px)] md:h-[calc(100%+32px)] w-[2px] bg-border/20" />
      )}
    </div>
    <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
      <Skeleton className="h-4 sm:h-5 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
        <Skeleton className="h-3 sm:h-4 w-14 sm:w-16" />
      </div>
      <Skeleton className="h-3 sm:h-4 w-1/2" />
    </div>
  </div>
);

// Extract pagination skeleton
const PaginationSkeleton = () => (
  <div className="flex justify-between items-center mt-3 sm:mt-4">
    <Skeleton className="h-3 sm:h-4 w-28 sm:w-40" />
    <div className="flex gap-1 sm:gap-2">
      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
      <Skeleton className="h-6 w-14 sm:h-8 sm:w-20" />
      <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />
    </div>
  </div>
);

// Extract skeleton loader component
const SkeletonLoader = () => (
  <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-3 md:p-6">
    {/* Header Skeleton */}
    <div className="space-y-1.5 sm:space-y-2">
      <Skeleton className="h-7 sm:h-8 md:h-9 w-48 sm:w-56 md:w-64" />
      <Skeleton className="h-4 sm:h-5 md:h-6 w-36 sm:w-40 md:w-48" />
    </div>

    {/* Activity Card Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
      {[1, 2].map((cardIndex) => (
        <Card key={cardIndex}>
          <CardHeader className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
            <Skeleton className="h-5 sm:h-6 md:h-7 w-36 sm:w-40 md:w-48" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Activity Item Skeletons */}
              {[1, 2, 3].map((i) => (
                <SkeletonItem key={i} isLast={i === 3} />
              ))}
              <PaginationSkeleton />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Extract content skeleton loader
const ContentSkeletonLoader = () => (
  <div className="space-y-4 sm:space-y-6 md:space-y-8">
    {[1, 2, 3].map((i) => (
      <SkeletonItem key={i} isLast={i === 3} />
    ))}
    <PaginationSkeleton />
  </div>
);

export default function AdminDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { activities, fetchAllActivities, isStoreLoading } = useUserStore();
  const {
    callLogs,
    fetchCallLogs,
    isLoading: isLoadingCallLogs,
    currentPage: callLogsPage,
    totalPages: callLogsTotalPages,
    totalCount,
    setPage: setCallLogsPage,
  } = useCallLogStore();

  // Pagination state
  const [activityPage, setActivityPage] = useState(1);

  // Fetch data on mount only
  useEffect(() => {
    const controller = new AbortController();

    console.log("Fetching call logs and activities...");
    void fetchAllActivities();
    void fetchCallLogs();

    // Cleanup function to abort fetch requests
    return () => {
      controller.abort();
    };
  }, [fetchAllActivities, fetchCallLogs]);

  // Refetch call logs when page changes
  useEffect(() => {
    console.log("Call logs page changed, refetching...", callLogsPage);
    fetchCallLogs();
  }, [callLogsPage, fetchCallLogs]);

  // Debug call logs data
  useEffect(() => {
    console.log("Call logs data:", callLogs);
    console.log("Call logs loading:", isLoadingCallLogs);
    console.log("Call logs pages:", callLogsTotalPages);
  }, [callLogs, isLoadingCallLogs, callLogsTotalPages]);

  // Memoize pagination calculations to avoid recalculation on each render
  const paginatedActivities = useMemo(() => {
    const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
    const startIndex = (activityPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, activities.length);
    const currentItems = activities.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems,
    };
  }, [activities, activityPage]);

  // Pagination handlers
  const goToNextCallLogsPage = () => {
    setCallLogsPage(callLogsPage + 1);
  };

  const goToPrevCallLogsPage = () => {
    setCallLogsPage(callLogsPage - 1);
  };

  const goToNextActivityPage = () => {
    setActivityPage((prev) =>
      Math.min(prev + 1, paginatedActivities.totalPages)
    );
  };

  const goToPrevActivityPage = () => {
    setActivityPage((prev) => Math.max(prev - 1, 1));
  };

  // Show skeleton loader when any data is loading
  if (isAuthLoading || isStoreLoading) {
    return <SkeletonLoader />;
  }

  // Require authenticated user
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Team Member Management
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Monitor and manage your team members
          </p>
        </div>
      </div>

      {/* Two column layout for cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Call Logs */}
        <Card className="h-full">
          <CardHeader className="px-3 sm:px-6 py-2 sm:py-4">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              Recent Call Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
            {isLoadingCallLogs ? (
              <ContentSkeletonLoader />
            ) : callLogs.length === 0 ? (
              <div className="text-center py-4 sm:py-8">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No call logs found
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {callLogs.map((callLog, index) => (
                    <div
                      key={callLog._id || `call-log-${index}`}
                      className="relative flex items-start gap-2 sm:gap-3 md:gap-4"
                    >
                      <div className="relative">
                        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-blue-500 text-white dark:text-black flex items-center justify-center">
                          {getCallDirectionIcon(callLog.from, callLog.to)}
                        </div>
                        {index !== callLogs.length - 1 && (
                          <div className="absolute left-[11px] sm:left-[13px] md:left-[15px] top-6 sm:top-7 md:top-8 h-[calc(100%+24px)] sm:h-[calc(100%+28px)] md:h-[calc(100%+32px)] w-[2px] bg-border" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground">
                          {formatPhoneNumber(callLog.from)} →{" "}
                          {formatPhoneNumber(callLog.to)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground break-words">
                          {callLog.transcription ||
                            "No transcription available"}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <Clock className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                          <time dateTime={callLog.createdAt}>
                            {format(
                              new Date(callLog.createdAt),
                              "MMM d, yyyy h:mm a"
                            )}
                          </time>
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs capitalize bg-blue-100 text-blue-800">
                            {callLog.from.startsWith("+112")
                              ? "Outgoing"
                              : "Incoming"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 sm:mt-4 gap-2 sm:gap-0">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {callLogs.length === 0 ? (
                      "No call logs to display"
                    ) : (
                      <>
                        Showing {(callLogsPage - 1) * 5 + 1}-
                        {Math.min(
                          callLogsPage * 5,
                          (callLogsPage - 1) * 5 + callLogs.length
                        )}{" "}
                        of {totalCount || callLogs.length}
                      </>
                    )}
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-0"
                      onClick={goToPrevCallLogsPage}
                      disabled={callLogsPage === 1 || isLoadingCallLogs}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="text-[10px] sm:text-xs py-1.5 sm:py-2 px-1">
                      Page {callLogsPage} of {callLogsTotalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-0"
                      onClick={goToNextCallLogsPage}
                      disabled={
                        callLogsPage === callLogsTotalPages || isLoadingCallLogs
                      }
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales Team Activity */}
        <Card className="h-full">
          <CardHeader className="px-3 sm:px-6 py-2 sm:py-4">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
            {isStoreLoading ? (
              <ContentSkeletonLoader />
            ) : activities.length === 0 ? (
              <div className="text-center py-4 sm:py-8">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No activities found
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  {paginatedActivities.currentItems.map((activity, index) => (
                    <div
                      key={activity._id || `activity-${index}`}
                      className="relative flex items-start gap-2 sm:gap-3 md:gap-4"
                    >
                      <div className="relative">
                        <div
                          className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ${getStatusColor(
                            activity.status || "default"
                          )} flex items-center justify-center`}
                        >
                          {getActivityIcon(activity.type || "default")}
                        </div>
                        {index !==
                          paginatedActivities.currentItems.length - 1 && (
                          <div className="absolute left-[11px] sm:left-[13px] md:left-[15px] top-6 sm:top-7 md:top-8 h-[calc(100%+24px)] sm:h-[calc(100%+28px)] md:h-[calc(100%+32px)] w-[2px] bg-border" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {activity.title || "No title"}{" "}
                          <span className="font-medium text-foreground">
                            -{" "}
                            {typeof activity.prospectId === "object" &&
                            activity.prospectId
                              ? activity.prospectId.fullName || "Unknown Name"
                              : "Unknown Prospect"}
                          </span>
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {activity.description || "No description"}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <Clock className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                          <time
                            dateTime={
                              activity.dueDate || new Date().toISOString()
                            }
                          >
                            {activity.dueDate
                              ? format(
                                  new Date(activity.dueDate),
                                  "MMM d, yyyy"
                                )
                              : "Unknown date"}
                          </time>
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${getStatusColor(
                              activity.status || "default"
                            )} bg-opacity-10 text-foreground`}
                          >
                            {activity.status || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 sm:mt-4 gap-2 sm:gap-0">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    Showing{" "}
                    {activities.length === 0
                      ? 0
                      : paginatedActivities.startIndex + 1}
                    -{paginatedActivities.endIndex} of {activities.length}
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-0"
                      onClick={goToPrevActivityPage}
                      disabled={activityPage === 1 || activities.length === 0}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="text-[10px] sm:text-xs py-1.5 sm:py-2 px-1">
                      Page {activities.length === 0 ? 0 : activityPage} of{" "}
                      {paginatedActivities.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-0"
                      onClick={goToNextActivityPage}
                      disabled={
                        activityPage === paginatedActivities.totalPages ||
                        activities.length === 0
                      }
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
