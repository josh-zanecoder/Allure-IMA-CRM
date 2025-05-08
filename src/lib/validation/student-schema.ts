import { z } from "zod";
import { Gender, PreferredContactMethod } from "@/types/prospect";

// Enums as Zod enums
export const EducationLevelEnum = z.enum([
  "High School",
  "Associates Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
]);

export const InterestEnum = z.enum([
  "Business",
  "Computer Science",
  "Engineering",
  "Healthcare",
  "Arts",
  "Education",
  "Law",
  "Science",
  "Social Science",
  "Other",
]);

export const StatusEnum = z.enum([
  "New",
  "Inquired",
  "Applied",
  "Enrolled",
  "In Progress",
  "Graduated",
  "Withdrawn",
  "On Hold",
]);

// Convert typescript enums to Zod enums
export const GenderEnum = z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]);
export const PreferredContactMethodEnum = z.enum([
  PreferredContactMethod.EMAIL,
  PreferredContactMethod.CALL,
  PreferredContactMethod.TEXT,
]);

// Address schema
export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(4),
});

// User schema
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.string(),
});

// Prospect schema
export const ProspectSchema = z
  .object({
    id: z.string(),
    fullName: z.string().optional(),
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name must be less than 50 characters" })
      .regex(/^[a-zA-Z\s-']+$/, {
        message:
          "First name can only contain letters, spaces, hyphens, and apostrophes",
      }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(50, { message: "Last name must be less than 50 characters" })
      .regex(/^[a-zA-Z\s-']+$/, {
        message:
          "Last name can only contain letters, spaces, hyphens, and apostrophes",
      }),
    gender: GenderEnum,
    genderOther: z.string().optional(),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, {
      message: "Phone number must be in format (XXX) XXX-XXXX",
    }),
    email: z.string().email(),
    address: AddressSchema,
    educationLevel: EducationLevelEnum.refine((val) => val !== undefined, {
      message: "Education level is required",
    }),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    status: StatusEnum,
    lastContact: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      }),
    createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    addedBy: UserSchema,
    assignedTo: UserSchema,
    preferredContactMethod: PreferredContactMethodEnum,
  })
  .superRefine((data, ctx) => {
    if (
      data.gender === Gender.OTHER &&
      (!data.genderOther || data.genderOther.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify gender if 'Other' is selected.",
        path: ["genderOther"],
      });
    }
  });

export type ProspectType = z.infer<typeof ProspectSchema>;
