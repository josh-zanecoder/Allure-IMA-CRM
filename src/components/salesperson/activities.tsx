"use client";

import { useState, useEffect } from "react";
import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  PhoneCallIcon,
  MailIcon,
  CalendarIcon,
  FileTextIcon,
  XCircleIcon,
  Loader2,
  AlertCircle,
  UserIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { toast } from "react-hot-toast";
import axios from "axios";

// Updated activity interface to match the provided data format
interface Prospect {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Activity {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  completedAt?: string | null;
  completedDate?: string;
  prospectId: Prospect | string;
  addedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Activity type and status enums
export enum ActivityType {
  CALL = "Call",
  EMAIL = "Email",
  MEETING = "Meeting",
  TASK = "Task",
  NOTE = "Note",
}

export enum ActivityStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

// Activity Icon component based on activity type
const ActivityTypeIcon = ({ type }: { type: string }) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("call"))
    return <PhoneCallIcon className="h-4 w-4" />;
  if (normalizedType.includes("email")) return <MailIcon className="h-4 w-4" />;
  if (normalizedType.includes("meeting"))
    return <CalendarIcon className="h-4 w-4" />;
  if (normalizedType.includes("task")) return <ClockIcon className="h-4 w-4" />;
  if (normalizedType.includes("note"))
    return <FileTextIcon className="h-4 w-4" />;

  return <CalendarClockIcon className="h-4 w-4" />;
};

// Badge for activity status
const ActivityStatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" | null =
    null;
  let icon = null;
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("pending")) {
    variant = "outline";
    icon = <ClockIcon className="h-3 w-3 mr-1" />;
  } else if (normalizedStatus.includes("in progress")) {
    variant = "secondary";
    icon = <ClockIcon className="h-3 w-3 mr-1" />;
  } else if (normalizedStatus.includes("completed")) {
    variant = "default";
    icon = <CheckCircle2Icon className="h-3 w-3 mr-1" />;
  } else if (normalizedStatus.includes("cancelled")) {
    variant = "destructive";
    icon = <XCircleIcon className="h-3 w-3 mr-1" />;
  }

  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {status}
    </Badge>
  );
};

// Function to format dates without external dependencies
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

// Get prospect info from activity
const getProspectInfo = (activity: Activity) => {
  if (typeof activity.prospectId === "object" && activity.prospectId !== null) {
    return activity.prospectId;
  }
  return null;
};

// Activity Item Component
const ActivityItem = ({ activity }: { activity: Activity }) => {
  const prospect = getProspectInfo(activity);

  return (
    <Card
      className="mb-4 border-l-4"
      style={{ borderLeftColor: "var(--primary)" }}
    >
      <CardHeader className="py-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-full">
              <ActivityTypeIcon type={activity.type} />
            </div>
            <CardTitle className="text-base">{activity.title}</CardTitle>
          </div>
          <ActivityStatusBadge status={activity.status} />
        </div>
        <CardDescription className="text-sm mt-2">
          {activity.description}
        </CardDescription>

        {prospect && (
          <div className="mt-3 flex items-center text-sm text-muted-foreground">
            <UserIcon className="h-3 w-3 mr-2" />
            <span>
              {prospect.firstName} {prospect.lastName} ({prospect.email})
            </span>
          </div>
        )}
      </CardHeader>
      <CardFooter className="py-3 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <CalendarClockIcon className="h-4 w-4 mr-2" />
          Due: {formatDate(activity.dueDate)}
        </div>
        {activity.status.toLowerCase() ===
          ActivityStatus.COMPLETED.toLowerCase() &&
          (activity.completedDate || activity.completedAt) && (
            <div className="flex items-center">
              <CheckCircle2Icon className="h-4 w-4 mr-2" />
              Completed:{" "}
              {formatDate(activity.completedDate || activity.completedAt || "")}
            </div>
          )}
      </CardFooter>
    </Card>
  );
};

export default function Activities({
  isOpenModal,
  onOpenChangeModal,
}: {
  isOpenModal: boolean;
  onOpenChangeModal: (open: boolean) => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch activities from API
  const fetchActivities = async () => {
    if (!isOpenModal) return; // Only fetch when modal is open

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get("/api/activities");

      if (response.status !== 200) {
        throw new Error("Failed to fetch activities");
      }

      setActivities(response.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpenModal) {
      fetchActivities();
    }
  }, [isOpenModal]);

  return (
    <Dialog open={isOpenModal} onOpenChange={onOpenChangeModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Activities</DialogTitle>
          <DialogDescription>
            View and manage your upcoming and recent activities
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 max-h-[calc(80vh-120px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading activities...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchActivities}
                className="mt-2"
              >
                Try Again
              </Button>
            </Alert>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CalendarClockIcon className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-medium">
                No activities found
              </h3>
              <p className="mt-2 text-sm text-center text-muted-foreground max-w-xs">
                There are no activities to display at this time.
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
