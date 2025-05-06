import { ObjectId } from "mongodb";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  photoURL: string | null;
  token: string;
  role: string;
  id: string | null;
  twilioNumber: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string;
  lastLogin?: Date;
  createdAt?: Date;
  redirectTo?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isRedirecting: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  google: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
