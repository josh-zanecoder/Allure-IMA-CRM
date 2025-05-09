import { z } from "zod";
import { Gender, PreferredContactMethod, CAMPUS } from "@/types/prospect";

// Updated Education Level to be numbers 1-20
export const EducationLevelEnum = z.number().int().min(1).max(20);

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

export const CampusEnum = z
  .string()
  .refine((val) => Object.values(CAMPUS).includes(val), {
    message: `Campus must be one of: ${Object.values(CAMPUS).join(", ")}`,
  })
  .optional();

// Helper function to calculate age from date of birth
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Address schema - now all fields optional
export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "ZIP code must contain only numbers",
    }),
});

// User schema
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.string(),
});

// Prospect schema - only firstName, lastName, and phone required
export const ProspectSchema = z.object({
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
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, {
    message: "Phone number must be in format (XXX) XXX-XXXX",
  }),
  email: z.string().email().optional(),
  address: AddressSchema.optional(),
  educationLevel: EducationLevelEnum.optional(),
  programInterest: InterestEnum.optional(),
  campus: CampusEnum,
  status: StatusEnum.optional().default("New"),
  lastContact: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  createdAt: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  updatedAt: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  addedBy: UserSchema.optional(),
  assignedTo: UserSchema.optional(),
  preferredContactMethod: PreferredContactMethodEnum.optional().default(
    PreferredContactMethod.CALL
  ),
});

export type ProspectType = z.infer<typeof ProspectSchema>;
