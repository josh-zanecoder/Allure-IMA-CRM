import axios from "axios";
import { create } from "zustand";
import { UserStore } from "@/types/user";
import { toast } from "sonner";

export const useUserStore = create<UserStore>((set, get) => ({
  userRole: null,
  students: [],
  salespersons: [],
  userData: null,
  activities: [],
  isStoreLoading: false,
  profileLoading: false,
  profileError: null,
  getUser: async () => {
    try {
      const [userDataResponse, studentsResponse] = await Promise.all([
        axios.get("/api/auth/authenticated"),
        axios.get("/api/students"),
      ]);
      set({
        userRole: userDataResponse.data.userData.role,
        students: studentsResponse.data.students,
        userData: userDataResponse.data.userData,
      });
    } catch (error) {
      console.error("Errr fetchig user data:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          },
        });
      }
    }
  },
  fetchSalespersons: async () => {
    try {
      set({ isStoreLoading: true });
      const res = await axios.get("/api/admin-salespersons");
      if (res.data && Array.isArray(res.data)) {
        set({ salespersons: res.data, isStoreLoading: false });
        return res.data;
      } else {
        console.error("Invalid salespersons data format:", res.data);
        set({ salespersons: [], isStoreLoading: false });
      }
    } catch (error) {
      console.error("Error fetching salespersons:", error);
      set({ salespersons: [], isStoreLoading: false });

      if (axios.isAxiosError(error)) {
        console.error("API Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          },
        });
      }
    }
  },
  fetchStudents: async () => {
    try {
      const res = await axios.get("/api/students");
      set({ students: res.data.students });
    } catch (error) {
      console.error("Error fetching students:", error);
      set({ students: [] });
    }
  },
  fetchAllActivities: async () => {
    try {
      set({ isStoreLoading: true });
      const res = await axios.get("/api/admin/dashboard");
      if (res.data?.success && Array.isArray(res.data.data)) {
        set({ activities: res.data.data, isStoreLoading: false });
        return res.data.data;
      }
      console.error("Invalid activities data format:", res.data);
      set({ activities: [], isStoreLoading: false });
      return [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      set({ activities: [], isStoreLoading: false });

      if (axios.isAxiosError(error)) {
        console.error("API Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          },
        });
      }
      return [];
    }
  },
  fetchAdminProfile: async () => {
    try {
      set({ profileLoading: true, profileError: null });
      const response = await axios.get("/api/admin/profile");

      // Update the userData in the store
      if (response.data && response.data.user) {
        set({
          userData: response.data.user,
          profileLoading: false,
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
        profileLoading: false,
        profileError: errorMessage,
      });

      return null;
    }
  },
  updateAdminProfile: async (profileData) => {
    try {
      set({ profileLoading: true, profileError: null });

      const response = await axios.put("/api/admin/profile", profileData);

      if (response.data && response.data.user) {
        // Update the userData in the store
        set({
          userData: response.data.user,
          profileLoading: false,
        });

        toast.success("Profile updated successfully");
        return response.data.user;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error updating admin profile:", error);
      let errorMessage = "Failed to update profile";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        profileLoading: false,
        profileError: errorMessage,
      });

      toast.error(errorMessage);
      return null;
    }
  },
}));
