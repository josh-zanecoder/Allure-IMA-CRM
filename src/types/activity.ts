export interface Prospect {
  _id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Activity {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  prospectId: string | Prospect; // Can be either ID or populated prospect
  addedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export type CreateActivity = Omit<
  Activity,
  "_id" | "createdAt" | "updatedAt" | "addedBy" | "isActive"
>;
export type UpdateActivity = Partial<CreateActivity>;
