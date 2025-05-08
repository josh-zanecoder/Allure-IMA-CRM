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
  AlertTriangleIcon,
  MessageSquareIcon,
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

// Define interfaces matching the provided data format
interface Prospect {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Reminder {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  completedAt?: string | null;
  prospectId: Prospect | string;
  addedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Reminder types and statuses
export enum ReminderType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  SMS = "SMS",
  MEETING = "MEETING",
  OTHER = "OTHER",
}

export enum ReminderStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  CANCELLED = "CANCELLED",
}

// Reminder Icon component based on reminder type
const ReminderTypeIcon = ({ type }: { type: string }) => {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("CALL"))
    return <PhoneCallIcon className="h-4 w-4" />;
  if (normalizedType.includes("EMAIL")) return <MailIcon className="h-4 w-4" />;
  if (normalizedType.includes("SMS"))
    return <MessageSquareIcon className="h-4 w-4" />;
  if (normalizedType.includes("MEETING"))
    return <CalendarIcon className="h-4 w-4" />;

  return <FileTextIcon className="h-4 w-4" />;
};

// Badge for reminder status
const ReminderStatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" | null =
    null;
  let icon = null;
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus.includes("PENDING")) {
    variant = "outline";
    icon = <ClockIcon className="h-3 w-3 mr-1" />;
  } else if (normalizedStatus.includes("SENT")) {
    variant = "default";
    icon = <CheckCircle2Icon className="h-3 w-3 mr-1" />;
  } else if (normalizedStatus.includes("CANCELLED")) {
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

// Function to check if a reminder is due soon (within 24 hours)
const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < 24 * 60 * 60 * 1000; // less than 24 hours in the future
};

// Get prospect info from reminder
const getProspectInfo = (reminder: Reminder) => {
  if (typeof reminder.prospectId === "object" && reminder.prospectId !== null) {
    return reminder.prospectId;
  }
  return null;
};

// Reminder Item Component
const ReminderItem = ({ reminder }: { reminder: Reminder }) => {
  const prospect = getProspectInfo(reminder);

  return (
    <Card
      className="mb-4 border-l-4"
      style={{ borderLeftColor: "var(--primary)" }}
    >
      <CardHeader className="py-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-full">
              <ReminderTypeIcon type={reminder.type} />
            </div>
            <CardTitle className="text-base">{reminder.title}</CardTitle>
          </div>
          <div className="flex gap-2 items-center">
            {isDueSoon(reminder.dueDate) && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangleIcon className="h-3 w-3" />
                Due Soon
              </Badge>
            )}
            <ReminderStatusBadge status={reminder.status} />
          </div>
        </div>
        <CardDescription className="text-sm mt-2">
          {reminder.description}
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
          Due: {formatDate(reminder.dueDate)}
        </div>
        {reminder.status.toUpperCase() === ReminderStatus.SENT &&
          reminder.completedAt && (
            <div className="flex items-center">
              <CheckCircle2Icon className="h-4 w-4 mr-2" />
              Completed: {formatDate(reminder.completedAt)}
            </div>
          )}
      </CardFooter>
    </Card>
  );
};

export default function Reminders({
  isOpenModal,
  onOpenChangeModal,
}: {
  isOpenModal: boolean;
  onOpenChangeModal: (open: boolean) => void;
}) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    if (!isOpenModal) return; // Only fetch when modal is open

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get("/api/reminders");

      if (response.status !== 200) {
        throw new Error("Failed to fetch reminders");
      }

      setReminders(response.data || []);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load reminders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpenModal) {
      fetchReminders();
    }
  }, [isOpenModal]);

  return (
    <Dialog open={isOpenModal} onOpenChange={onOpenChangeModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Upcoming Reminders</DialogTitle>
          <DialogDescription>
            View and manage your upcoming and past reminders
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 max-h-[calc(80vh-120px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading reminders...
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
                onClick={fetchReminders}
                className="mt-2"
              >
                Try Again
              </Button>
            </Alert>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CalendarClockIcon className="h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-medium">No reminders found</h3>
              <p className="mt-2 text-sm text-center text-muted-foreground max-w-xs">
                There are no reminders to display at this time.
              </p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <ReminderItem key={reminder._id} reminder={reminder} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
