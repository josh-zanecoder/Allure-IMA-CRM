import { z } from "zod";
import { ProspectReferenceSchema } from "./activity-schema";

// Reminder types and status
export const ReminderType = z.enum([
  "CALL_BACK",
  "FOLLOW_UP",
  "MEETING",
  "DEADLINE",
  "EMAIL",
  "CALL",
  "OTHER",
]);

export const ReminderStatus = z.enum([
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "SENT",
]);

// Reminder schema for API responses
export const ReminderSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  type: ReminderType,
  status: ReminderStatus,
  dueDate: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  addedBy: z.string(),
  prospectId: z.union([z.string(), ProspectReferenceSchema]),
});

// Create reminder schema
export const CreateReminderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string(),
  type: ReminderType,
  dueDate: z.string().datetime(),
  prospectId: z.string(),
  status: ReminderStatus.optional().default("PENDING"),
});

// Update reminder schema
export const UpdateReminderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  type: ReminderType.optional(),
  status: ReminderStatus.optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional().nullable(),
});

// Type definitions
export type Reminder = z.infer<typeof ReminderSchema>;
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;
export type UpdateReminderInput = z.infer<typeof UpdateReminderSchema>;
