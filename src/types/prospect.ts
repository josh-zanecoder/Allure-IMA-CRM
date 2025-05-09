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
  INTRO_MUA = "Intro MUA",
  PRO_MUA = "Pro MUA",
  EYELASH_EXTENSION = "Eyelash Extension",
  MICROBLADING = "Microblading",
  MICROSHADING = "Microshading",
  HAIRSTYLING = "Hairstyling",
  ESTHETICIAN = "Esthetician",
  COSMETOLOGY = "Cosmetology",
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
  SANTA_ANA: "Santa Ana",
  SOUTH_GATE: "South Gate",
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
