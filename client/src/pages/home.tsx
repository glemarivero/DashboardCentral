import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SearchBar from "@/components/ui/search-bar";
import DashboardCard from "@/components/ui/dashboard-card";
import DashboardTile from "@/components/ui/dashboard-tile";
import DashboardDetailModal from "@/components/ui/dashboard-detail-modal";
import { useDashboardContext } from "@/context/dashboard-context";
import { Link, useLocation } from "wouter";
import { Category } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye } from "lucide-react";

export default function Home() {
  const { selectedCategory, setSelectedCategory } = useDashboardContext();
  const [modalDashboardId, setModalDashboardId] = useState<number | null>(null);
  const [activeTabCategory, setActiveTabCategory] = useState<Category | "all">("all");
  const [location, navigate] = useLocation();

  // Fetch featured dashboards
  const { data: featuredDashboards, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["/api/dashboards/featured"],
    queryFn: async () => {
      const response = await fetch("/api/dashboards/featured", {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch featured dashboards");
      }
      return response.json();
    }
  });

  // Fetch recent dashboards
  const { data: recentDashboards, isLoading: isRecentLoading } = useQuery({
    queryKey: ["/api/dashboards/recent"],
    queryFn: async () => {
      const response = await fetch("/api/dashboards/recent", {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recent dashboards");
      }
      return response.json();
    }
  });

  // Fetch all dashboards
  const { data: allDashboards, isLoading: isAllDashboardsLoading } = useQuery({
    queryKey: ["/api/dashboards"],
    queryFn: async () => {
      const response = await fetch("/api/dashboards", {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch all dashboards");
      }
      return response.json();
    }
  });

  // Filter dashboards based on active tab
  const filteredDashboards = allDashboards?.filter(
    (dashboard: any) => activeTabCategory === "all" || dashboard.category === activeTabCategory
  );

  // Handle category filter click
  const handleCategoryFilterClick = (category: Category | "all") => {
    setActiveTabCategory(category);
    setSelectedCategory(category);
    if (category !== "all") {
      navigate(`/category/${category}`);
    }
  };

  // Open dashboard detail modal
  const openDashboardModal = (id: number) => {
    setModalDashboardId(id);
  };

  // Close dashboard detail modal
  const closeDashboardModal = () => {
    setModalDashboardId(null);
  };

  return (
    <div className="font-sans bg-neutral-light text-secondary min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Search Bar */}
        <section className="bg-gradient-to-r from-primary/90 to-primary">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Find the right dashboard for your insights
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Search across our collection of dashboards to discover the data that powers your business decisions
              </p>
            </div>
            
            <SearchBar />
          </div>
        </section>

        {/* Category Quick Filters */}
        <section className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <button 
              className={`px-4 py-2 rounded-full border border-neutral-medium ${
                activeTabCategory === "all" 
                  ? "bg-primary text-white" 
                  : "bg-white hover:bg-neutral-light"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm md:text-base`}
              onClick={() => handleCategoryFilterClick("all")}
            >
              All Dashboards
            </button>
            <button 
              className={`px-4 py-2 rounded-full border border-neutral-medium ${
                activeTabCategory === "data" 
                  ? "bg-primary text-white" 
                  : "bg-white hover:bg-neutral-light"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm md:text-base`}
              onClick={() => handleCategoryFilterClick("data")}
            >
              Data
            </button>
            <button 
              className={`px-4 py-2 rounded-full border border-neutral-medium ${
                activeTabCategory === "business" 
                  ? "bg-primary text-white" 
                  : "bg-white hover:bg-neutral-light"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm md:text-base`}
              onClick={() => handleCategoryFilterClick("business")}
            >
              Business
            </button>
            <button 
              className={`px-4 py-2 rounded-full border border-neutral-medium ${
                activeTabCategory === "ecom" 
                  ? "bg-primary text-white" 
                  : "bg-white hover:bg-neutral-light"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm md:text-base`}
              onClick={() => handleCategoryFilterClick("ecom")}
            >
              ECOM
            </button>
            <button 
              className={`px-4 py-2 rounded-full border border-neutral-medium ${
                activeTabCategory === "strategy" 
                  ? "bg-primary text-white" 
                  : "bg-white hover:bg-neutral-light"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm md:text-base`}
              onClick={() => handleCategoryFilterClick("strategy")}
            >
              Strategy
            </button>
          </div>
        </section>

        {/* Featured Dashboards Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Featured Dashboards</h2>
            <Link href="/category/all" className="text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isFeaturedLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : featuredDashboards && featuredDashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDashboards.map((dashboard: any) => (
                <DashboardCard key={dashboard.id} dashboard={dashboard} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-neutral-dark">No featured dashboards available</p>
            </div>
          )}
        </section>

        {/* Recently Used Dashboards */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recently Used</h2>
            <Link href="#" className="text-primary hover:underline flex items-center gap-1">
              View history <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isRecentLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : recentDashboards && recentDashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentDashboards.map((dashboard: any) => (
                <div key={dashboard.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-base">{dashboard.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={dashboard.category === "ecom" ? "bg-accent/10 text-accent" : 
                                dashboard.category === "strategy" ? "bg-secondary/10 text-secondary" : 
                                "bg-primary/10 text-primary"}
                    >
                      {dashboard.category.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-neutral-dark text-xs mb-3">{dashboard.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-neutral-dark">
                      <Eye className="h-3 w-3 mr-1" /> {dashboard.views.toLocaleString()} views
                    </div>
                    <Link href={`/dashboard/${dashboard.id}`} className="text-primary text-xs font-medium hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-neutral-dark">No recently used dashboards</p>
            </div>
          )}
        </section>

        {/* Category Based Dashboards */}
        <section className="bg-neutral-light py-8 mt-4">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Explore All Dashboards</h2>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 border-b border-neutral-medium">
              <div className="flex overflow-x-auto space-x-8 pb-2 category-tabs">
                <button 
                  className={`${activeTabCategory === "all" ? "text-primary border-b-2 border-primary" : "text-gray-800 hover:text-primary"} pb-2 font-medium whitespace-nowrap`}
                  onClick={() => setActiveTabCategory("all")}
                >
                  All Dashboards
                </button>
                <button 
                  className={`${activeTabCategory === "data" ? "text-primary border-b-2 border-primary" : "text-gray-800 hover:text-primary"} pb-2 font-medium whitespace-nowrap`}
                  onClick={() => setActiveTabCategory("data")}
                >
                  Data
                </button>
                <button 
                  className={`${activeTabCategory === "business" ? "text-primary border-b-2 border-primary" : "text-gray-800 hover:text-primary"} pb-2 font-medium whitespace-nowrap`}
                  onClick={() => setActiveTabCategory("business")}
                >
                  Business
                </button>
                <button 
                  className={`${activeTabCategory === "ecom" ? "text-primary border-b-2 border-primary" : "text-gray-800 hover:text-primary"} pb-2 font-medium whitespace-nowrap`}
                  onClick={() => setActiveTabCategory("ecom")}
                >
                  ECOM
                </button>
                <button 
                  className={`${activeTabCategory === "strategy" ? "text-primary border-b-2 border-primary" : "text-gray-800 hover:text-primary"} pb-2 font-medium whitespace-nowrap`}
                  onClick={() => setActiveTabCategory("strategy")}
                >
                  Strategy
                </button>
              </div>
            </div>

            {/* Dashboard Grid */}
            {isAllDashboardsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredDashboards && filteredDashboards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDashboards.map((dashboard: any) => (
                  <DashboardTile key={dashboard.id} dashboard={dashboard} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-neutral-dark">No dashboards found for this category</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Dashboard Detail Modal */}
      {modalDashboardId && (
        <DashboardDetailModal 
          dashboardId={modalDashboardId} 
          isOpen={!!modalDashboardId} 
          onClose={closeDashboardModal} 
        />
      )}
    </div>
  );
}
