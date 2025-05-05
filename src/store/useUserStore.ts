import axios from "axios";
import { create } from "zustand";
import { UserStore } from "@/types/user";

export const useUserStore = create<UserStore>((set) => ({
  userRole: null,
  students: [],
  userData: null,
  activities: [],
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
      console.error("Error fetching user data:", error);
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
    const res = await axios.get("/api/students");
    set({ students: res.data.students });
  },
  fetchAllActivities: async () => {
    try {
      const res = await axios.get("/api/admin/dashboard");
      if (res.data?.success && Array.isArray(res.data.data)) {
        set({ activities: res.data.data });
        return res.data.data;
      }
      console.error("Invalid activities data format:", res.data);
      return [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },
}));
