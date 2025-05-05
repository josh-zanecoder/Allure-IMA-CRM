"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Plus, CheckCircle2, Clock, FileText } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Email":
      return (
        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "Meeting":
      return (
        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "Task":
      return (
        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    default:
      return (
        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-500 text-white dark:text-black";
    case "In Progress":
      return "bg-amber-500 text-white dark:text-black";
    case "Cancelled":
      return "bg-destructive text-white dark:text-black";
    default:
      return "bg-primary text-white dark:text-black";
  }
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { activities, fetchAllActivities } = useUserStore();

  useEffect(() => {
    fetchAllActivities();
  }, [fetchAllActivities]);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-64" />
          <Skeleton className="h-5 sm:h-6 w-48" />
        </div>

        {/* Activity Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 sm:h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6 sm:space-y-8">
              {/* Activity Item Skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4">
                  <div className="relative">
                    <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                    {i !== 3 && (
                      <div className="absolute left-[13px] sm:left-[15px] top-7 sm:top-8 h-[calc(100%+32px)] w-[2px] bg-border/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sales Team Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage your sales team
          </p>
        </div>
      </div>

      {/* Sales Team Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 sm:space-y-8">
            {activities.map((activity, index) => (
              <div
                key={activity._id}
                className="relative flex items-start gap-3 sm:gap-4"
              >
                <div className="relative">
                  <div
                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${getStatusColor(
                      activity.status
                    )} flex items-center justify-center`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[13px] sm:left-[15px] top-7 sm:top-8 h-[calc(100%+32px)] w-[2px] bg-border" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm text-muted-foreground break-words">
                    {activity.title}{" "}
                    <span className="font-medium text-foreground">
                      -{" "}
                      {typeof activity.prospectId === "object"
                        ? activity.prospectId.fullName
                        : "Unknown Prospect"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <time dateTime={activity.dueDate}>
                      {format(new Date(activity.dueDate), "MMM d, yyyy")}
                    </time>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                        activity.status
                      )} bg-opacity-10 text-foreground`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
