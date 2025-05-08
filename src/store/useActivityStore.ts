import { create } from "zustand";
import { Activity } from "@/lib/validation/activity-schema";
import axios from "axios";

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: () => Promise<void>;
  resetError: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,

  fetchActivities: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get("/api/activities");

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.error || "Failed to fetch activities");
      }

      const data = response.data;
      set({ activities: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching activities:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch activities",
        isLoading: false,
      });
    }
  },

  resetError: () => set({ error: null }),
}));
