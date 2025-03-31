import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { formatDistance } from "date-fns";
import { ArrowLeft, ArrowRight, Star, Eye } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function DashboardDetail() {
  const { id } = useParams();
  const dashboardId = parseInt(id);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch dashboard details
  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ["/api/dashboards", dashboardId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard details");
      }
      return response.json();
    },
    enabled: !isNaN(dashboardId)
  });

  // Update favorite state when dashboard data changes
  useEffect(() => {
    if (dashboard?.isFavorite) {
      setIsFavorited(dashboard.isFavorite);
    }
  }, [dashboard]);

  // Fetch similar dashboards (same category)
  const { data: similarDashboards, isLoading: isSimilarLoading } = useQuery({
    queryKey: ["/api/dashboards/category", dashboard?.category],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/category/${dashboard.category}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch similar dashboards");
      }
      return response.json();
    },
    enabled: !!dashboard?.category
  });

  // Toggle favorite mutation
  const favoriteToggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/dashboards/favorite/${dashboardId}`);
      } else {
        await apiRequest("POST", "/api/dashboards/favorite", { dashboardId });
      }
      return !isFavorited;
    },
    onSuccess: (newFavoriteState) => {
      setIsFavorited(newFavoriteState);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", dashboardId] });
    }
  });

  const handleFavoriteToggle = () => {
    favoriteToggleMutation.mutate();
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "ecom":
        return "bg-accent text-white";
      case "business":
        return "bg-primary text-white";
      case "strategy":
        return "bg-secondary text-white";
      case "data":
        return "bg-primary text-white";
      default:
        return "bg-primary text-white";
    }
  };

  return (
    <div className="font-sans bg-neutral-light text-secondary min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <a className="inline-flex items-center text-neutral-dark hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard Portal
            </a>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-error mb-2">Error</h2>
            <p className="text-neutral-dark">Failed to load dashboard details. Please try again.</p>
          </div>
        ) : dashboard ? (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(dashboard.category)}`}>
                        {dashboard.category.toUpperCase()}
                      </span>
                      <button 
                        className={`flex items-center gap-1 ${isFavorited ? 'text-accent' : 'text-neutral-dark hover:text-secondary'}`}
                        onClick={handleFavoriteToggle}
                      >
                        <Star className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                        <span>{isFavorited ? 'Favorited' : 'Add to favorites'}</span>
                      </button>
                    </div>
                    <h1 className="text-3xl font-bold">{dashboard.title}</h1>
                  </div>
                  <div className="flex items-center text-neutral-dark">
                    <Eye className="h-5 w-5 mr-2" />
                    <span>{dashboard.views.toLocaleString()} views</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <div className="bg-neutral-light rounded-lg overflow-hidden">
                      <img 
                        src={dashboard.imageUrl} 
                        alt={`${dashboard.title} Preview`}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-neutral-light rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Dashboard Details</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm text-neutral-dark">Created by</h3>
                        <p className="font-medium">{dashboard.createdBy}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-dark">Created</h3>
                        <p className="font-medium">
                          {formatDistance(new Date(dashboard.createdAt), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-dark">Last updated</h3>
                        <p className="font-medium">
                          {formatDistance(new Date(dashboard.updatedAt), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-neutral-dark">Category</h3>
                        <p className="font-medium capitalize">{dashboard.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-neutral-dark">{dashboard.description}</p>
                </div>
                
                <div className="flex justify-center">
                  <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                    Launch Dashboard
                  </button>
                </div>
              </div>
            </div>
            
            {/* Similar Dashboards Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Similar Dashboards</h2>
                <Link href={`/category/${dashboard.category}`}>
                  <a className="text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
              </div>
              
              {isSimilarLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : similarDashboards && similarDashboards.length > 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {similarDashboards
                    .filter((d: any) => d.id !== dashboard.id)
                    .slice(0, 3)
                    .map((similarDashboard: any) => (
                      <div key={similarDashboard.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-lg mb-2">{similarDashboard.title}</h3>
                        <p className="text-neutral-dark text-sm mb-4 line-clamp-2">{similarDashboard.description}</p>
                        <Link href={`/dashboard/${similarDashboard.id}`}>
                          <a className="text-primary font-medium hover:underline">View Dashboard</a>
                        </Link>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-neutral-dark">No similar dashboards found</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-neutral-dark">Dashboard not found</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
