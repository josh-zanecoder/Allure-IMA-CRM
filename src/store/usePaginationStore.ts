import { create } from "zustand";
import axios from "axios";
import { Prospect } from "@/types/prospect";

// Add a debounce mechanism to prevent API spam
let lastFetchTime = 0;
const FETCH_COOLDOWN_MS = 2000; // 2 seconds cooldown between fetches

interface PaginationState {
  prospects: Prospect[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastFetchStatus: "success" | "empty" | "error" | null;

  // Actions
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  fetchProspects: () => Promise<void>;
}

export const usePaginationStore = create<PaginationState>((set, get) => ({
  prospects: [],
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  searchQuery: "",
  isLoading: false,
  error: null,
  lastFetchStatus: null,

  setPage: (page) => set({ currentPage: page }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  fetchProspects: async () => {
    const { currentPage, searchQuery, lastFetchStatus } = get();

    // Implement cooldown to prevent API spam
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN_MS) {
      // If we recently got an empty result, don't fetch again
      if (lastFetchStatus === "empty") {
        return;
      }
    }

    lastFetchTime = now;

    try {
      set({ isLoading: true, error: null });

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchQuery) {
        searchParams.append("search", searchQuery);
      }

      const response = await axios.get(
        `/api/prospects?${searchParams.toString()}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch prospects");
      }

      const data = response.data;

      // Set lastFetchStatus based on whether we got any prospects
      const fetchStatus = data.prospects.length > 0 ? "success" : "empty";

      set({
        prospects: data.prospects,
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        isLoading: false,
        lastFetchStatus: fetchStatus,
      });
    } catch (error) {
      console.error("Error fetching prospects:", error);
      set({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
        lastFetchStatus: "error",
      });
    }
  },
}));
