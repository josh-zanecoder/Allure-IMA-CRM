import { ObjectId } from "mongodb";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  token: string;
  twilioNumber: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string;
  lastLogin?: Date;
  createdAt?: Date;
  redirectTo?: string;
  googleLinked?: boolean;
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
  google: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
