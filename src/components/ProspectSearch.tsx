import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePaginationStore } from "@/store/usePaginationStore";
import { useDebouncedCallback } from "use-debounce";

export function ProspectSearch() {
  const { setSearchQuery } = usePaginationStore();

  const debouncedSearch = useDebouncedCallback((query: string) => {
    setSearchQuery(query);
  }, 300);

  return (
    <div className="flex items-center space-x-2 pb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search prospects..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
