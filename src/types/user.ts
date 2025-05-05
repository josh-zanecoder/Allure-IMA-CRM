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

export type UserStore = {
  userRole: string | null;
  students: Student[];
  userData: UserData | null;
  getUser: () => Promise<void>;
  fetchStudents: () => Promise<void>;
};
