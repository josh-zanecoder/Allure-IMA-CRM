export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export type EducationLevel = number;

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export enum Interest {
  BUSINESS = "Business",
  COMPUTER_SCIENCE = "Computer Science",
  ENGINEERING = "Engineering",
  HEALTHCARE = "Healthcare",
  ARTS = "Arts",
  EDUCATION = "Education",
  LAW = "Law",
  SCIENCE = "Science",
  SOCIAL_SCIENCE = "Social Science",
  OTHER = "Other",
}

export enum Status {
  New = "New",
  Inquired = "Inquired",
  Applied = "Applied",
  Enrolled = "Enrolled",
  InProgress = "In Progress",
  Graduated = "Graduated",
  Withdrawn = "Withdrawn",
  OnHold = "On Hold",
}

export enum PreferredContactMethod {
  EMAIL = "Email",
  CALL = "Call",
  TEXT = "Text",
}

// Change Campus from enum to string type
export type Campus = string;

// Define constants for standard campus values but don't use enum
export const CAMPUS = {
  MAIN: "Main Campus",
  DOWNTOWN: "Downtown Campus",
  WEST: "West Campus",
  NORTH: "North Campus",
  SOUTH: "South Campus",
  ONLINE: "Online Campus",
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Prospect {
  id: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: Address;
  educationLevel?: EducationLevel;
  preferredContactMethod?: PreferredContactMethod;
  campus?: Campus;
  interests?: string[];
  notes?: string;
  status?: Status;
  lastContact?: string;
  createdAt?: string;
  updatedAt?: string;
  addedBy?: User;
  assignedTo?: User;
}

export interface Student {
  id: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: Address;
  educationLevel?: EducationLevel;
  preferredContactMethod?: PreferredContactMethod;
  campus?: Campus;
  interests?: string[];
  notes?: string;
  status?: Status;
  lastContact?: string;
  createdAt?: string;
  updatedAt?: string;
  addedBy?: User;
  assignedTo?: User;
}
