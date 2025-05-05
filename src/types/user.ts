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
  // Add other properties as needed
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

export type UserStore = {
  userRole: string | null;
  students: Student[];
  userData: UserData | null;
  activities: Activity[];
  getUser: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchAllActivities: () => Promise<void>;
};
