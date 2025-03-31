import { createContext, useContext, useState, ReactNode } from "react";
import { Category } from "@shared/schema";

interface DashboardContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | "all";
  setSelectedCategory: (category: Category | "all") => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  return (
    <DashboardContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
}
