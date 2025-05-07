"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  UserRound,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import axios from "axios";
import { InteractionType, InteractionStatus } from "@/models/InteractionRecord";

// Type for interaction records
interface InteractionRecord {
  _id: string;
  userId: string;
  prospectId: string;
  interactionId: string;
  interactionType: string;
  subject: string;
  details: string;
  status: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  extraData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

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

const getInteractionIcon = (type: string) => {
  switch (type) {
    case "call":
      return (
        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "email":
      return (
        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "meeting":
      return (
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "note":
      return (
        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "sms":
      return (
        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      );
    case "visit":
      return (
        <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
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

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { activities, fetchAllActivities } = useUserStore();
  const [interactions, setInteractions] = useState<InteractionRecord[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);

  useEffect(() => {
    fetchAllActivities();

    // Fetch interaction records
    const fetchInteractions = async () => {
      try {
        setIsLoadingInteractions(true);
        const response = await axios.get("/api/interactions");
        if (response.data && response.data.interactions) {
          setInteractions(response.data.interactions);
        }
      } catch (error) {
        console.error("Error fetching interactions:", error);
      } finally {
        setIsLoadingInteractions(false);
      }
    };

    fetchInteractions();
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

      {/* Interaction Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Recent Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingInteractions ? (
            <div className="space-y-6 sm:space-y-8">
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
          ) : interactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No interaction records found
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {interactions.map((interaction, index) => (
                <div
                  key={interaction._id}
                  className="relative flex items-start gap-3 sm:gap-4"
                >
                  <div className="relative">
                    <div
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${getStatusColor(
                        interaction.status
                      )} flex items-center justify-center`}
                    >
                      {getInteractionIcon(interaction.interactionType)}
                    </div>
                    {index !== interactions.length - 1 && (
                      <div className="absolute left-[13px] sm:left-[15px] top-7 sm:top-8 h-[calc(100%+32px)] w-[2px] bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {interaction.subject}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {interaction.details}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <time dateTime={interaction.createdAt}>
                        {format(
                          new Date(interaction.createdAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </time>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs capitalize ${getStatusColor(
                          interaction.status
                        )} bg-opacity-10 text-foreground`}
                      >
                        {interaction.status.replace("_", " ")}
                      </span>
                      {interaction.extraData &&
                        interaction.extraData.direction && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800 capitalize">
                            {interaction.extraData.direction}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
