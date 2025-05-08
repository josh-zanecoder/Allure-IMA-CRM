import { create } from "zustand";
import { Reminder } from "@/lib/validation/reminder-schema";

interface ReminderState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReminders: () => Promise<void>;
  resetError: () => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,

  fetchReminders: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch("/api/reminders");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reminders");
      }

      const data = await response.json();
      set({ reminders: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching reminders:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch reminders",
        isLoading: false,
      });
    }
  },

  resetError: () => set({ error: null }),
}));
