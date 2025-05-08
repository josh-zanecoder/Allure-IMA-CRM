"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Users, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Activities from "@/components/salesperson/activities";
import Reminders from "@/components/salesperson/reminders";

interface Reminder {
  _id: string;
  title: string;
  dueDate: string;
  type: string;
  prospectId:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
      };
}

interface Activity {
  _id: string;
  title: string;
  createdAt: string;
  type: string;
  dueDate?: string | null;
  prospectId:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
      };
}

interface DashboardStats {
  totalProspects: number;
  pendingReminders: number;
  upcomingReminders: Reminder[];
  recentActivities: Activity[];
  prospectGrowth: {
    percent: string;
    trend: "up" | "down";
    comparison: string;
  };
  reminderChange: {
    percent: string;
    trend: "up" | "down";
    comparison: string;
  };
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProspects: 0,
    pendingReminders: 0,
    upcomingReminders: [],
    recentActivities: [],
    prospectGrowth: { percent: "0.0", trend: "up", comparison: "month" },
    reminderChange: { percent: "0.0", trend: "down", comparison: "week" },
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/salesperson/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      setStats((prev) => ({
        ...prev,
        ...data.stats,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "salesperson")) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Show nothing while checking auth
  if (isAuthLoading) {
    return null;
  }

  // Show nothing if not authenticated
  if (!user) {
    return null;
  }

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return diff < 24 * 60 * 60 * 1000 && diff > 0; // less than 24 hours
  };

  const isExpired = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now; // Due date is in the past
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Activities Modal */}
      <Activities
        isOpenModal={isActivitiesModalOpen}
        onOpenChangeModal={setIsActivitiesModalOpen}
      />

      {/* Reminders Modal */}
      <Reminders
        isOpenModal={isRemindersModalOpen}
        onOpenChangeModal={setIsRemindersModalOpen}
      />

      {isLoading ? (
        // Skeleton loader
        <>
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <Card className="w-full">
              <CardHeader className="relative">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-2" />
                    <Skeleton className="h-6 sm:h-8 w-14 sm:w-16" />
                  </div>
                  <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
              </CardFooter>
            </Card>

            <Card className="w-full">
              <CardHeader className="relative">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-2" />
                    <Skeleton className="h-6 sm:h-8 w-14 sm:w-16" />
                  </div>
                  <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-32 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Skeleton className="h-9 sm:h-10 w-full" />
                <Skeleton className="h-9 sm:h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Reminders & Activities Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                <Skeleton className="h-7 sm:h-8 w-14 sm:w-16" />
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3 sm:p-4 rounded-lg border"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                      <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
                      <Skeleton className="h-2.5 sm:h-3 w-36 sm:w-40" />
                    </div>
                    <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                <Skeleton className="h-7 sm:h-8 w-14 sm:w-16" />
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3 sm:p-4 rounded-lg border"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                      <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
                      <Skeleton className="h-2.5 sm:h-3 w-36 sm:w-40" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // Actual dashboard content
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <Card className="w-full">
              <CardHeader className="relative">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardDescription className="text-sm">
                      Total Prospects
                    </CardDescription>
                    <CardTitle className="text-xl sm:text-2xl font-semibold tabular-nums">
                      {stats.totalProspects}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={
                      stats.prospectGrowth.trend === "up"
                        ? "default"
                        : "destructive"
                    }
                    className="flex gap-1 rounded-lg text-xs whitespace-nowrap"
                  >
                    {stats.prospectGrowth.trend === "up" ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {stats.prospectGrowth.percent}%
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {stats.prospectGrowth.trend === "up"
                    ? "Growing steadily"
                    : "Decreasing"}
                  {stats.prospectGrowth.trend === "up" ? (
                    <ArrowUpRight className="size-3 sm:size-4" />
                  ) : (
                    <ArrowDownRight className="size-3 sm:size-4" />
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Compared to last {stats.prospectGrowth.comparison}
                </div>
              </CardFooter>
            </Card>

            <Card className="w-full">
              <CardHeader className="relative">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="rounded-lg bg-yellow-500/10 p-2 sm:p-3">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardDescription className="text-sm">
                      Pending Tasks
                    </CardDescription>
                    <CardTitle className="text-xl sm:text-2xl font-semibold tabular-nums">
                      {stats.pendingReminders}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={
                      stats.reminderChange.trend === "down"
                        ? "default"
                        : "destructive"
                    }
                    className="flex gap-1 rounded-lg text-xs whitespace-nowrap"
                  >
                    {stats.reminderChange.trend === "up" ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {stats.reminderChange.percent}%
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {stats.reminderChange.trend === "down"
                    ? "Decreased"
                    : "Increased"}{" "}
                  this {stats.reminderChange.comparison}
                  {stats.reminderChange.trend === "down" ? (
                    <ArrowDownRight className="size-3 sm:size-4" />
                  ) : (
                    <ArrowUpRight className="size-3 sm:size-4" />
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stats.reminderChange.trend === "down"
                    ? "Good task completion rate"
                    : "More tasks pending than before"}
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Common tasks and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Button
                  onClick={() => router.push("/salesperson/prospects")}
                  className="w-full text-sm"
                  variant="default"
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  View All Prospects
                </Button>
                <Button
                  onClick={() => router.push("/salesperson/prospects/new")}
                  className="w-full text-sm"
                  variant="secondary"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add New Prospect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reminders & Activities Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Upcoming Reminders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg sm:text-xl">
                  Upcoming Reminders
                </CardTitle>
                <Button
                  variant="ghost"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => setIsRemindersModalOpen(true)}
                >
                  View all
                </Button>
              </CardHeader>
              <CardContent>
                {stats.upcomingReminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming reminders.
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {stats.upcomingReminders.map((reminder) => {
                      // Calculate if due soon (within 24 hours)
                      const isDueSoonReminder = isDueSoon(reminder.dueDate);
                      // Calculate if almost due (within 3 days)
                      const isAlmostDue = (() => {
                        const due = new Date(reminder.dueDate);
                        const now = new Date();
                        const diff = due.getTime() - now.getTime();
                        return (
                          diff > 0 &&
                          diff < 3 * 24 * 60 * 60 * 1000 &&
                          !isDueSoonReminder
                        );
                      })();
                      // Check if expired
                      const isExpiredReminder = isExpired(reminder.dueDate);

                      // Get prospect name
                      const prospectName = (() => {
                        if (typeof reminder.prospectId === "string") {
                          return "Unknown Prospect";
                        }
                        return (
                          `${reminder.prospectId.firstName || ""} ${
                            reminder.prospectId.lastName || ""
                          }`.trim() || "Unknown Prospect"
                        );
                      })();

                      return (
                        <div
                          key={reminder._id}
                          className={`flex items-start justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                            isExpiredReminder
                              ? "border-2 border-red-500 bg-red-50/10"
                              : isDueSoonReminder
                              ? "border-yellow-400"
                              : isAlmostDue
                              ? "border-yellow-400"
                              : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {reminder.title}
                            </p>
                            <div className="flex flex-wrap gap-1 items-center">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {reminder.type}
                              </p>
                              <span className="text-xs opacity-50">•</span>
                              <p className="text-xs sm:text-sm font-medium text-primary">
                                {prospectName}
                              </p>
                            </div>
                            <time
                              className="text-xs sm:text-sm text-muted-foreground"
                              dateTime={reminder.dueDate}
                            >
                              {new Date(reminder.dueDate).toLocaleString()}
                            </time>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            {isExpiredReminder && (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs bg-red-500"
                              >
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Expired
                              </Badge>
                            )}
                            {isDueSoonReminder && !isExpiredReminder && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs border-yellow-400 text-yellow-600"
                              >
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Due Soon
                              </Badge>
                            )}
                            {isAlmostDue && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs border-yellow-400 text-yellow-600"
                              >
                                <Clock className="h-3 w-3" />
                                Almost Due
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg sm:text-xl">
                  Recent Activities
                </CardTitle>
                <Button
                  variant="ghost"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => setIsActivitiesModalOpen(true)}
                >
                  View all
                </Button>
              </CardHeader>
              <CardContent>
                {stats.recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recent activities.
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {stats.recentActivities.map((activity) => {
                      // Get prospect name
                      const prospectName = (() => {
                        if (typeof activity.prospectId === "string") {
                          return "Unknown Prospect";
                        }
                        return (
                          `${activity.prospectId.firstName || ""} ${
                            activity.prospectId.lastName || ""
                          }`.trim() || "Unknown Prospect"
                        );
                      })();

                      // Calculate if due soon (within 24 hours)
                      const isDueSoonActivity = (() => {
                        if (!activity.dueDate) return false;
                        const due = new Date(activity.dueDate);
                        const now = new Date();
                        const diff = due.getTime() - now.getTime();
                        return diff > 0 && diff < 24 * 60 * 60 * 1000;
                      })();

                      // Calculate if almost due (within 3 days)
                      const isAlmostDue = (() => {
                        if (!activity.dueDate) return false;
                        const due = new Date(activity.dueDate);
                        const now = new Date();
                        const diff = due.getTime() - now.getTime();
                        return (
                          diff > 0 &&
                          diff < 3 * 24 * 60 * 60 * 1000 &&
                          !isDueSoonActivity
                        );
                      })();

                      // Check if expired
                      const isExpiredActivity = (() => {
                        if (!activity.dueDate) return false;
                        return isExpired(activity.dueDate);
                      })();

                      return (
                        <div
                          key={activity._id}
                          className={`flex items-start justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                            isExpiredActivity
                              ? "border-2 border-red-500"
                              : isDueSoonActivity
                              ? "border-yellow-400"
                              : isAlmostDue
                              ? "border-yellow-400"
                              : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {activity.title}
                            </p>
                            <div className="flex flex-wrap gap-1 items-center">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {activity.type}
                              </p>
                              <span className="text-xs opacity-50">•</span>
                              <p className="text-xs sm:text-sm font-medium text-primary">
                                {prospectName}
                              </p>
                            </div>
                            <div className="flex flex-col gap-0">
                              {activity.dueDate && (
                                <time
                                  className="text-xs sm:text-sm text-muted-foreground"
                                  dateTime={activity.dueDate}
                                >
                                  <span className="font-medium">Due:</span>{" "}
                                  {new Date(activity.dueDate).toLocaleString()}
                                </time>
                              )}
                              <time
                                className="text-xs sm:text-sm text-muted-foreground"
                                dateTime={activity.createdAt}
                              >
                                <span className="font-medium">Created:</span>{" "}
                                {new Date(activity.createdAt).toLocaleString()}
                              </time>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            {isExpiredActivity && (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs bg-red-500"
                              >
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Expired
                              </Badge>
                            )}
                            {isDueSoonActivity && !isExpiredActivity && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs border-yellow-400 text-yellow-600"
                              >
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Due Soon
                              </Badge>
                            )}
                            {isAlmostDue && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs border-yellow-400 text-yellow-600"
                              >
                                <Clock className="h-3 w-3" />
                                Almost Due
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
