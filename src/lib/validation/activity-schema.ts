import { z } from "zod";

// Activity types and status
export const ActivityType = z.enum([
  "CALL",
  "CALL_BACK",
  "EMAIL",
  "FOLLOW_UP",
  "MEETING",
  "DEADLINE",
  "NOTE",
  "TASK",
  "OTHER",
]);

export const ActivityStatus = z.enum([
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "SENT",
]);

// Prospect reference schema (minimal data needed)
export const ProspectReferenceSchema = z
  .object({
    _id: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .nullable()
  .optional();

// Activity schema for API responses
export const ActivitySchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  type: ActivityType,
  status: ActivityStatus,
  dueDate: z.string().datetime().nullable().optional(),
  completedDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  addedBy: z.string(),
  prospectId: z.union([z.string(), ProspectReferenceSchema]),
});

// Create activity schema
export const CreateActivitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string(),
  type: ActivityType,
  dueDate: z.string().datetime(),
  prospectId: z.string(),
  status: ActivityStatus.optional().default("PENDING"),
});

// Update activity schema
export const UpdateActivitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  type: ActivityType.optional(),
  status: ActivityStatus.optional(),
  dueDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional().nullable(),
});

// Type definitions
export type Activity = z.infer<typeof ActivitySchema>;
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type ProspectReference = z.infer<typeof ProspectReferenceSchema>;
