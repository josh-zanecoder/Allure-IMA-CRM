import { create } from "zustand";
import axios from "axios";
import { Prospect } from "@/types/prospect";

interface PaginationState {
  prospects: Prospect[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

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

  setPage: (page) => set({ currentPage: page }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  fetchProspects: async () => {
    const { currentPage, searchQuery } = get();

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
      set({
        prospects: data.prospects,
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching prospects:", error);
      set({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
      });
    }
  },
}));
