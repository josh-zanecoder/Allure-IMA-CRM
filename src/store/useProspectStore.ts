import axios from "axios";
import { create } from "zustand";
import { Prospect, Student } from "@/types/prospect";

interface ProspectStore {
  // State
  profileData: any | null;
  prospects: Prospect[];
  currentProspect: Prospect | null;
  isLoading: boolean;
  error: string | null;

  // Admin Profile Actions
  fetchAdminProfile: () => Promise<any | null>;
  clearProfileData: () => void;

  // Prospect Actions
  fetchProspects: () => Promise<Prospect[]>;
  fetchProspectById: (id: string) => Promise<Prospect | null>;
  updateProspect: (
    id: string,
    prospectData: Partial<Prospect>
  ) => Promise<Prospect | null>;
  createProspect: (
    prospectData: Omit<Student, "id" | "createdAt" | "updatedAt">
  ) => Promise<Prospect | null>;
  deleteProspect: (id: string) => Promise<boolean>;
}

export const useProspectStore = create<ProspectStore>((set, get) => ({
  // State
  profileData: null,
  prospects: [],
  currentProspect: null,
  isLoading: false,
  error: null,

  // Admin Profile Actions
  fetchAdminProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get("/api/admin/profile");

      if (response.data && response.data.user) {
        set({
          profileData: response.data.user,
          isLoading: false,
        });
        return response.data.user;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      let errorMessage = "Failed to load profile";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return null;
    }
  },

  clearProfileData: () => {
    set({ profileData: null, error: null });
  },

  // Prospect Actions
  fetchProspects: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get("/api/prospects");

      if (response.data) {
        set({
          prospects: response.data,
          isLoading: false,
        });
        return response.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
      let errorMessage = "Failed to load prospects";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return [];
    }
  },

  fetchProspectById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(`/api/prospects/${id}/details`);

      if (response.data) {
        set({
          currentProspect: response.data,
          isLoading: false,
        });
        return response.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(`Error fetching prospect with ID ${id}:`, error);
      let errorMessage = "Failed to load prospect details";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return null;
    }
  },

  updateProspect: async (id: string, prospectData: Partial<Prospect>) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.put(
        `/api/prospects/${id}/details`,
        prospectData
      );

      if (response.data) {
        // Update the current prospect in state
        set((state) => ({
          currentProspect: response.data,
          // Also update the prospect in the prospects array if it exists
          prospects: state.prospects.map((p) =>
            p.id === id ? response.data : p
          ),
          isLoading: false,
        }));
        return response.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(`Error updating prospect with ID ${id}:`, error);
      let errorMessage = "Failed to update prospect";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return null;
    }
  },

  createProspect: async (
    prospectData: Omit<Student, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      set({ isLoading: true, error: null });

      // First check if email already exists
      const emailCheckResponse = await axios.get(
        `/api/prospects/check-email?email=${encodeURIComponent(
          prospectData.email
        )}`
      );

      if (emailCheckResponse.data.exists) {
        throw new Error("A student with this email already exists");
      }

      // Prepare the data with fullName field
      const submitData = {
        ...prospectData,
        fullName: `${prospectData.firstName} ${prospectData.lastName}`,
      };

      const response = await axios.post("/api/prospects/create", submitData);

      if (response.data) {
        // Add the new prospect to state
        set((state) => ({
          prospects: [...state.prospects, response.data],
          isLoading: false,
        }));
        return response.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error creating prospect:", error);
      let errorMessage = "Failed to create prospect";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return null;
    }
  },

  deleteProspect: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await axios.delete(`/api/prospects/${id}`);

      // Remove the deleted prospect from state
      set((state) => ({
        prospects: state.prospects.filter((p) => p.id !== id),
        currentProspect:
          state.currentProspect?.id === id ? null : state.currentProspect,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error(`Error deleting prospect with ID ${id}:`, error);
      let errorMessage = "Failed to delete prospect";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return false;
    }
  },
}));
