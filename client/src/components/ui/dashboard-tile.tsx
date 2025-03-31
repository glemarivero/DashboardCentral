import { Dashboard } from "@shared/schema";
import { Link } from "wouter";
import { Eye, Star } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface DashboardTileProps {
  dashboard: Dashboard;
  isFavorite?: boolean;
}

export default function DashboardTile({ dashboard, isFavorite = false }: DashboardTileProps) {
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "data":
        return "bg-blue-100 text-blue-800 font-semibold";
      case "business":
        return "bg-green-100 text-green-800 font-semibold";
      case "ecom":
        return "bg-purple-100 text-purple-800 font-semibold";
      case "strategy":
        return "bg-amber-100 text-amber-800 font-semibold";
      default:
        return "bg-blue-100 text-blue-800 font-semibold";
    }
  };

  const favoriteToggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/dashboards/favorite/${dashboard.id}`);
      } else {
        await apiRequest("POST", "/api/dashboards/favorite", { dashboardId: dashboard.id });
      }
      return !isFavorited;
    },
    onSuccess: (newFavoriteState) => {
      setIsFavorited(newFavoriteState);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards/favorites"] });
    }
  });
  
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteToggleMutation.mutate();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col h-full" data-category={dashboard.category}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${getCategoryColor(dashboard.category)}`}>
          {dashboard.category.charAt(0).toUpperCase() + dashboard.category.slice(1)}
        </span>
        <button 
          className={`${isFavorited ? 'text-accent' : 'text-neutral-dark hover:text-secondary'}`}
          onClick={handleFavoriteToggle}
        >
          <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </div>
      <h3 className="font-bold text-base text-black mb-1">{dashboard.title}</h3>
      <p className="text-gray-700 text-xs mb-3 flex-grow">{dashboard.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-700 font-medium">
          <Eye className="inline h-3 w-3 mr-1" /> {dashboard.views.toLocaleString()} views
        </span>
        <Link href={`/dashboard/${dashboard.id}`} className="text-primary font-semibold hover:underline">
          Open
        </Link>
      </div>
    </div>
  );
}
