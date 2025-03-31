import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DashboardTile from "@/components/ui/dashboard-tile";
import { useDashboardContext } from "@/context/dashboard-context";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Category as CategoryType } from "@shared/schema";

export default function Category() {
  const { category = "" } = useParams();
  const { setSelectedCategory } = useDashboardContext();
  const isValidCategory = ["data", "business", "ecom", "strategy", "all"].includes(category);
  
  // Update selected category in context
  useEffect(() => {
    if (isValidCategory) {
      setSelectedCategory(category as CategoryType | "all");
    }
  }, [category, setSelectedCategory, isValidCategory]);

  // Query to get all dashboards
  const { data: allDashboards, isLoading } = useQuery({
    queryKey: ["/api/dashboards"],
    queryFn: async () => {
      const response = await fetch("/api/dashboards", {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboards");
      }
      return response.json();
    }
  });

  // Query to get dashboards by category
  const { data: categoryDashboards, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["/api/dashboards/category", category],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/category/${category}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} dashboards`);
      }
      return response.json();
    },
    enabled: isValidCategory && category !== "all"
  });

  // Determine dashboards to display
  const dashboardsToDisplay = category === "all" ? allDashboards : categoryDashboards;
  const isLoadingDashboards = category === "all" ? isLoading : isCategoryLoading;

  // Format category name for display
  const getCategoryDisplayName = (categorySlug: string) => {
    switch (categorySlug) {
      case "data": return "Data";
      case "business": return "Business";
      case "ecom": return "ECOM";
      case "strategy": return "Strategy";
      case "all": return "All";
      default: return categorySlug;
    }
  };

  return (
    <div className="font-sans bg-neutral-light text-secondary min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-neutral-dark hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard Portal
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{getCategoryDisplayName(category)} Dashboards</h1>
          {category !== "all" && (
            <p className="text-neutral-dark mt-2">
              Browse all dashboards in the {getCategoryDisplayName(category)} category
            </p>
          )}
        </div>
        
        {!isValidCategory ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-error mb-2">Invalid Category</h2>
            <p className="text-neutral-dark">The requested category does not exist.</p>
            <Link href="/" className="text-primary hover:underline inline-block mt-4">
              Return to Dashboard Portal
            </Link>
          </div>
        ) : isLoadingDashboards ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : dashboardsToDisplay && dashboardsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dashboardsToDisplay.map((dashboard: any) => (
              <DashboardTile key={dashboard.id} dashboard={dashboard} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-neutral-dark">No dashboards found in this category</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
