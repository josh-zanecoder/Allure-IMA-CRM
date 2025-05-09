import { create } from "zustand";
import axios from "axios";

export interface Reminder {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "overdue";
  type?: string;
  createdAt: string;
  updatedAt: string;
  addedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ReminderStore {
  // State
  reminders: Reminder[];
  currentReminder: Reminder | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReminders: (prospectId: string) => Promise<Reminder[]>;
  addReminder: (
    prospectId: string,
    reminderData: Omit<Reminder, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => Promise<Reminder | null>;
  updateReminder: (
    prospectId: string,
    reminderId: string,
    reminderData: Partial<Reminder>
  ) => Promise<Reminder | null>;
  deleteReminder: (prospectId: string, reminderId: string) => Promise<boolean>;
  markReminderComplete: (
    prospectId: string,
    reminderId: string
  ) => Promise<Reminder | null>;
  clearErrors: () => void;
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  // State
  reminders: [],
  currentReminder: null,
  isLoading: false,
  error: null,

  // Actions
  fetchReminders: async (prospectId: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await axios.get(
        `/api/prospects/${prospectId}/reminders`
      );

      // Map API response statuses to our store's format
      const mappedReminders = response.data.map((reminder: any) => {
        // Convert API status to our store format
        let storeStatus: "pending" | "completed" | "overdue";
        switch (reminder.status) {
          case "SENT":
            storeStatus = "completed";
            break;
          case "CANCELLED":
            storeStatus = "overdue";
            break;
          case "PENDING":
          default:
            storeStatus = "pending";
            break;
        }

        // Add priority field which our store requires
        return {
          ...reminder,
          status: storeStatus,
          priority: "medium", // Default priority
          dueDate: new Date(reminder.dueDate), // Convert string to Date
        };
      });

      set({
        reminders: mappedReminders,
        isLoading: false,
      });

      return mappedReminders;
    } catch (error) {
      console.error("Error fetching reminders:", error);
      let errorMessage = "Failed to load reminders";

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

  addReminder: async (
    prospectId: string,
    reminderData: Omit<Reminder, "_id" | "createdAt" | "updatedAt" | "addedBy">
  ) => {
    try {
      set({ isLoading: true, error: null });

      // Convert our store's status format to the API's expected enum format
      let apiStatus;
      switch (reminderData.status) {
        case "completed":
          apiStatus = "SENT"; // API expects SENT for completed reminders
          break;
        case "overdue":
          apiStatus = "CANCELLED"; // API expects CANCELLED for overdue reminders
          break;
        case "pending":
        default:
          apiStatus = "PENDING"; // API expects PENDING for pending reminders
          break;
      }

      // Prepare API data in the format expected by the backend
      const apiData = {
        title: reminderData.title,
        description: reminderData.description,
        type: reminderData.type || "OTHER", // Ensure we have a default type
        status: apiStatus,
        dueDate: reminderData.dueDate.toISOString(),
      };

      console.log("Sending reminder data to API:", apiData);

      const response = await axios.post(
        `/api/prospects/${prospectId}/reminders`,
        apiData
      );

      // Map API response back to our store's format
      const responseData = {
        ...response.data,
        status: reminderData.status, // Keep our store's status format
      };

      // Update the reminders list with the new reminder
      set((state) => ({
        reminders: [...state.reminders, responseData],
        isLoading: false,
      }));

      return responseData;
    } catch (error) {
      console.error("Error adding reminder:", error);
      let errorMessage = "Failed to add reminder";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error; // Re-throw so we can handle it in the component
    }
  },

  updateReminder: async (
    prospectId: string,
    reminderId: string,
    reminderData: Partial<Reminder>
  ) => {
    try {
      set({ isLoading: true, error: null });

      // Create a copy of the data to send to API
      const apiData: Record<string, any> = { ...reminderData };

      // Convert status format if it exists in the update data
      if (reminderData.status) {
        switch (reminderData.status) {
          case "completed":
            apiData.status = "SENT";
            break;
          case "overdue":
            apiData.status = "CANCELLED";
            break;
          case "pending":
            apiData.status = "PENDING";
            break;
        }
      }

      // Convert dueDate to ISO string if it exists
      if (reminderData.dueDate && reminderData.dueDate instanceof Date) {
        apiData.dueDate = reminderData.dueDate.toISOString();
      }

      // Remove store-specific fields the API doesn't need
      delete apiData.priority;

      console.log("Sending update to API:", apiData);

      const response = await axios.put(
        `/api/prospects/${prospectId}/reminders/${reminderId}`,
        apiData
      );

      // Convert the response back to our store format
      const responseData = {
        ...response.data,
        status: reminderData.status || response.data.status,
      };

      // Update the reminders list with the updated reminder
      set((state) => ({
        reminders: state.reminders.map((rem) =>
          rem._id === reminderId ? responseData : rem
        ),
        isLoading: false,
      }));

      return responseData;
    } catch (error) {
      console.error(`Error updating reminder with ID ${reminderId}:`, error);
      let errorMessage = "Failed to update reminder";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  deleteReminder: async (prospectId: string, reminderId: string) => {
    try {
      set({ isLoading: true, error: null });

      await axios.delete(
        `/api/prospects/${prospectId}/reminders/${reminderId}`
      );

      // Remove the deleted reminder from the list
      set((state) => ({
        reminders: state.reminders.filter((rem) => rem._id !== reminderId),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error(`Error deleting reminder with ID ${reminderId}:`, error);
      let errorMessage = "Failed to delete reminder";

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

  markReminderComplete: async (prospectId: string, reminderId: string) => {
    try {
      set({ isLoading: true, error: null });

      // The API expects "SENT" for completed reminders, not "completed"
      console.log("Sending status update to API...");

      const response = await axios.put(
        `/api/prospects/${prospectId}/reminders/${reminderId}`,
        {
          status: "SENT", // API expects SENT, not completed
          completedAt: new Date().toISOString(), // Add the completedAt field
        }
      );

      console.log("API response:", response.data);

      // Map API response to our store's format
      const responseData = {
        ...response.data,
        status: "completed", // Map back to our store's format
        dueDate: new Date(response.data.dueDate), // Ensure date is converted
      };

      // Update the reminders list with the completed reminder
      set((state) => ({
        reminders: state.reminders.map((rem) =>
          rem._id === reminderId ? responseData : rem
        ),
        isLoading: false,
      }));

      return responseData;
    } catch (error) {
      console.error(
        `Error marking reminder as complete with ID ${reminderId}:`,
        error
      );
      let errorMessage = "Failed to update reminder status";

      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error; // Re-throw to handle in component
    }
  },

  clearErrors: () => {
    set({ error: null });
  },
}));
