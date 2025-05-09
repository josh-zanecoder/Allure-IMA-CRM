import { create } from "zustand";
import axios from "axios";

export interface CallLog {
  _id: string;
  to: string;
  from: string;
  userId: string;
  prospectId: string;
  callSid: string;
  memberId: string;
  parentCallSid: string;
  activityId: string;
  transcription: string;
  createdAt: string;
  updatedAt: string;
}

interface CallLogState {
  callLogs: CallLog[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPage: (page: number) => void;
  fetchCallLogs: () => Promise<void>;
}

export const useCallLogStore = create<CallLogState>((set, get) => ({
  callLogs: [],
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
  error: null,

  setPage: (page) => set({ currentPage: page }),

  fetchCallLogs: async () => {
    const { currentPage } = get();
    console.log("Fetching call logs for page:", currentPage);

    try {
      set({ isLoading: true, error: null });

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "5",
      });

      console.log(
        "Call logs API URL:",
        `/api/calllogs?${searchParams.toString()}`
      );

      const response = await axios.get(
        `/api/calllogs?${searchParams.toString()}`
      );

      console.log("Call logs API response:", response.data);

      if (response.status !== 200) {
        throw new Error("Failed to fetch call logs");
      }

      const data = response.data;
      set({
        callLogs: data.callLogs || [],
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching call logs:", error);
      set({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
        callLogs: [], // Reset to empty array on error
      });
    }
  },
}));
