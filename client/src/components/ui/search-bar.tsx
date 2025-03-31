import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useDashboardContext } from "@/context/dashboard-context";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function SearchBar() {
  const { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen } = useDashboardContext();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSearchOpen]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length >= 2) {
        setDebouncedSearchTerm(inputValue);
        setIsSearchOpen(true);
      } else {
        setDebouncedSearchTerm("");
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setIsSearchOpen]);

  // Search Mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/dashboards/search", { query, limit: 5 });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards/search"] });
    }
  });

  // Execute search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchMutation.mutate(debouncedSearchTerm);
      setSearchQuery(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchMutation, setSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      searchMutation.mutate(inputValue);
      setSearchQuery(inputValue);
      setIsSearchOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Determine category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "data":
        return "bg-primary/10 text-primary";
      case "business":
        return "bg-primary/10 text-primary";
      case "ecom":
        return "bg-accent/10 text-accent";
      case "strategy":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="max-w-3xl mx-auto" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for dashboards (e.g., 'Monthly sales overview')"
          className="w-full py-4 px-6 pr-12 rounded-lg shadow-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim().length >= 2 && setIsSearchOpen(true)}
        />
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary p-2 rounded-full hover:bg-neutral-light transition-colors"
          onClick={handleSearch}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      
      {/* Search Results */}
      {isSearchOpen && (
        <div className="bg-white rounded-lg mt-2 shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-neutral-medium">
            <h3 className="font-semibold text-sm text-neutral-dark">
              {searchMutation.isPending ? "Searching..." : "Top Results"}
            </h3>
          </div>
          <div className="p-2">
            {searchMutation.isPending ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : searchMutation.isSuccess && searchMutation.data.dashboards && searchMutation.data.dashboards.length > 0 ? (
              searchMutation.data.dashboards.map((result: any, idx: number) => (
                <Link key={idx} href={`/dashboard/${result.dashboard.id}`}>
                  <a className="p-2 hover:bg-neutral-light rounded cursor-pointer block">
                    <div className="flex items-start justify-between mb-1">
                      <span className={`inline-block px-1.5 py-0.5 text-xs rounded mr-2 ${getCategoryColor(result.dashboard.category)}`}>
                        {result.dashboard.category.toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-dark">
                        {Math.round(result.similarity * 100)}% match
                      </span>
                    </div>
                    <span className="font-medium block">{result.dashboard.title}</span>
                    <span className="text-xs text-neutral-dark">{result.dashboard.description}</span>
                  </a>
                </Link>
              ))
            ) : searchMutation.isSuccess ? (
              <div className="p-4 text-center text-neutral-dark">
                No results found for "{debouncedSearchTerm}"
              </div>
            ) : searchMutation.isError ? (
              <div className="p-4 text-center text-error">
                Error searching dashboards
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
