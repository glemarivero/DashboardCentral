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
      <h3 className="font-medium text-base mb-1">{dashboard.title}</h3>
      <p className="text-neutral-dark text-xs mb-3 flex-grow">{dashboard.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-dark">
          <Eye className="inline h-3 w-3 mr-1" /> {dashboard.views.toLocaleString()} views
        </span>
        <Link href={`/dashboard/${dashboard.id}`} className="text-primary font-medium hover:underline">
          Open
        </Link>
      </div>
    </div>
  );
}
