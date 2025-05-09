import z from "zod";

export type UserData = {
  id: string;
  firebase_uid: string;
  phone: string;
  twilio_phone_number: string;
  role: string;
  email: string;
  avatar: string;
  status: string;
  firstName: string;
  lastName: string;
  displayName: string;
  googleLinked: boolean;
  // Add other properties as needed
};

export type AdminProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export type Student = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  educationLevel: string;
  dateOfBirth: string;
  preferredContactMethod: string;
  interests: string[];
  notes: string;
  status: string;
  addedBy: {
    id: string;
    email: string;
    role: string;
  };
  assignedTo: {
    id: string;
    email: string;
    role: string;
  };
  updatedBy: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
  // Add other properties as needed
};

export type Activity = {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  completedDate: string;
  prospectId: string | Prospect;
  addedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface Prospect {
  _id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
}

const salespersonSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string(),
  twilio_number: z.string().optional(),
  forwarding_number: z.string().optional(),
  is_forwarding: z.boolean().optional(),
  firebase_uid: z.string(),
  status: z.enum(["active", "inactive"]),
  role: z.enum(["salesperson"]),
  joinDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Salesperson = z.infer<typeof salespersonSchema>;

export type UserStore = {
  userRole: string | null;
  students: Student[];
  salespersons: Salesperson[];
  userData: UserData | null;
  activities: Activity[];
  isStoreLoading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  getUser: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchSalespersons: () => Promise<Salesperson[] | undefined>;
  fetchAllActivities: () => Promise<void>;
  fetchAdminProfile: () => Promise<UserData | null>;
  updateAdminProfile: (
    profileData: AdminProfileData
  ) => Promise<UserData | null>;
};
