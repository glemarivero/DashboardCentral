import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Link } from "wouter";
import { formatDistance } from "date-fns";

interface DashboardDetailModalProps {
  dashboardId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardDetailModal({ dashboardId, isOpen, onClose }: DashboardDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Close on escape key
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Fetch dashboard data
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
    enabled: isOpen && dashboardId > 0
  });
  
  if (!isOpen) {
    return null;
  }

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case "ecom":
        return "bg-accent/10 text-accent";
      case "business":
        return "bg-primary/10 text-primary";
      case "strategy":
        return "bg-secondary/10 text-secondary";
      case "data":
        return "bg-primary/10 text-primary";
      default:
        return "bg-primary/10 text-primary";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        ref={modalRef} 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-error">Error</h2>
              <button className="text-neutral-dark hover:text-secondary text-xl" onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-neutral-dark">Failed to load dashboard details. Please try again.</p>
          </div>
        ) : dashboard ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-block px-2 py-1 text-xs rounded mb-2 ${getCategoryBadgeClass(dashboard.category)}`}>
                  {dashboard.category.toUpperCase()}
                </span>
                <h2 className="text-2xl font-semibold">{dashboard.title}</h2>
              </div>
              <button className="text-neutral-dark hover:text-secondary text-xl" onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="bg-neutral-light rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-neutral-dark">Created by:</span>
                  <span className="font-medium"> {dashboard.createdBy}</span>
                </div>
                <div>
                  <span className="text-neutral-dark">Last updated:</span>
                  <span className="font-medium"> {formatDistance(new Date(dashboard.updatedAt), new Date(), { addSuffix: true })}</span>
                </div>
                <div>
                  <span className="text-neutral-dark">Views:</span>
                  <span className="font-medium"> {dashboard.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-neutral-dark">{dashboard.description}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Preview</h3>
              <div className="bg-neutral-medium rounded-lg overflow-hidden">
                <img 
                  src={dashboard.imageUrl} 
                  alt={`${dashboard.title} Full Preview`}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Link href={`/dashboard/${dashboard.id}`}>
                <a className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  Open Dashboard
                </a>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-neutral-dark">No dashboard data available</div>
        )}
      </div>
    </div>
  );
}
