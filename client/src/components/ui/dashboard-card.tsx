import { Link } from "wouter";
import { Dashboard } from "@shared/schema";
import { Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface DashboardCardProps {
  dashboard: Dashboard;
  isFavorite?: boolean;
}

export default function DashboardCard({ dashboard, isFavorite = false }: DashboardCardProps) {
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ecom":
        return "bg-purple-600 text-white font-semibold";
      case "business":
        return "bg-green-600 text-white font-semibold";
      case "strategy":
        return "bg-amber-600 text-white font-semibold";
      case "data":
        return "bg-blue-600 text-white font-semibold";
      default:
        return "bg-blue-600 text-white font-semibold";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return "Yesterday";
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-neutral-medium">
        <img 
          src={dashboard.imageUrl} 
          alt={`${dashboard.title} Preview`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getCategoryColor(dashboard.category)}>
            {dashboard.category.toUpperCase()}
          </Badge>
        </div>
        {isFavorited && (
          <button 
            className="absolute top-2 left-2 text-accent bg-white rounded-full p-1"
            onClick={handleFavoriteToggle}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-black mb-1">{dashboard.title}</h3>
        <p className="text-gray-700 text-sm mb-3">{dashboard.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-700 font-medium">
            Last updated: {formatTimeAgo(new Date(dashboard.updatedAt))}
          </span>
          <Link href={`/dashboard/${dashboard.id}`} className="text-primary text-sm font-semibold hover:underline">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
