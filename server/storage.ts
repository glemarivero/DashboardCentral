import { 
  dashboards, 
  type Dashboard, 
  type InsertDashboard, 
  type Category,
  recentDashboards,
  type RecentDashboard,
  type InsertRecentDashboard,
  favoriteDashboards,
  type FavoriteDashboard,
  type InsertFavoriteDashboard,
  users,
  type User,
  type InsertUser
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (keeping original methods)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dashboard operations
  getAllDashboards(): Promise<Dashboard[]>;
  getDashboardById(id: number): Promise<Dashboard | undefined>;
  getDashboardsByCategory(category: Category): Promise<Dashboard[]>;
  getFeaturedDashboards(limit?: number): Promise<Dashboard[]>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;
  incrementDashboardViews(id: number): Promise<Dashboard | undefined>;
  searchDashboards(query: string): Promise<Dashboard[]>;
  getDashboardEmbeddings(): Promise<{ id: number; title: string; description: string; embeddings: number[] | null }[]>;
  updateDashboardEmbeddings(id: number, embeddings: number[]): Promise<Dashboard | undefined>;
  
  // Recent dashboards operations
  getRecentDashboards(limit?: number): Promise<Dashboard[]>;
  addRecentDashboard(dashboardId: number): Promise<RecentDashboard>;
  
  // Favorite dashboards operations
  getFavoriteDashboards(): Promise<Dashboard[]>;
  addFavoriteDashboard(dashboardId: number): Promise<FavoriteDashboard>;
  removeFavoriteDashboard(dashboardId: number): Promise<boolean>;
  isFavoriteDashboard(dashboardId: number): Promise<boolean>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dashboards: Map<number, Dashboard>;
  private recentDashboards: InsertRecentDashboard[];
  private favoriteDashboards: Set<number>;
  private currentUserId: number;
  private currentDashboardId: number;
  private currentRecentId: number;
  private currentFavoriteId: number;

  constructor() {
    this.users = new Map();
    this.dashboards = new Map();
    this.recentDashboards = [];
    this.favoriteDashboards = new Set();
    this.currentUserId = 1;
    this.currentDashboardId = 1;
    this.currentRecentId = 1;
    this.currentFavoriteId = 1;
    
    // Initialize with sample dashboards
    this.initializeSampleDashboards();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Dashboard operations
  async getAllDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  async getDashboardById(id: number): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async getDashboardsByCategory(category: Category): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(
      (dashboard) => dashboard.category === category
    );
  }

  async getFeaturedDashboards(limit: number = 3): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values())
      .filter((dashboard) => dashboard.isFeatured)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const id = this.currentDashboardId++;
    const now = new Date();
    const dashboard: Dashboard = {
      ...insertDashboard,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now,
      embeddings: null
    };
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  async updateDashboard(id: number, partialDashboard: Partial<Dashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      return undefined;
    }
    
    const updatedDashboard: Dashboard = {
      ...dashboard,
      ...partialDashboard,
      updatedAt: new Date()
    };
    
    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    return this.dashboards.delete(id);
  }

  async incrementDashboardViews(id: number): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      return undefined;
    }
    
    const updatedDashboard: Dashboard = {
      ...dashboard,
      views: dashboard.views + 1,
      updatedAt: new Date()
    };
    
    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }

  async searchDashboards(query: string): Promise<Dashboard[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.dashboards.values()).filter(
      (dashboard) => 
        dashboard.title.toLowerCase().includes(lowercaseQuery) ||
        dashboard.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getDashboardEmbeddings(): Promise<{ id: number; title: string; description: string; embeddings: number[] | null }[]> {
    return Array.from(this.dashboards.values()).map(dashboard => ({
      id: dashboard.id,
      title: dashboard.title,
      description: dashboard.description,
      embeddings: dashboard.embeddings ? JSON.parse(dashboard.embeddings) : null
    }));
  }

  async updateDashboardEmbeddings(id: number, embeddings: number[]): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      return undefined;
    }
    
    const updatedDashboard: Dashboard = {
      ...dashboard,
      embeddings: JSON.stringify(embeddings),
      updatedAt: new Date()
    };
    
    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }

  // Recent dashboards operations
  async getRecentDashboards(limit: number = 4): Promise<Dashboard[]> {
    const recentIds = this.recentDashboards
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, limit)
      .map(recent => recent.dashboardId);
    
    return recentIds.map(id => this.dashboards.get(id)).filter(Boolean) as Dashboard[];
  }

  async addRecentDashboard(dashboardId: number): Promise<RecentDashboard> {
    const id = this.currentRecentId++;
    const now = new Date();
    
    // Remove any existing entry for this dashboard to avoid duplicates
    this.recentDashboards = this.recentDashboards.filter(
      recent => recent.dashboardId !== dashboardId
    );
    
    // Add the new recent entry
    const recent: RecentDashboard = {
      id,
      dashboardId,
      viewedAt: now
    };
    
    this.recentDashboards.push(recent);
    return recent;
  }

  // Favorite dashboards operations
  async getFavoriteDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(
      dashboard => this.favoriteDashboards.has(dashboard.id)
    );
  }

  async addFavoriteDashboard(dashboardId: number): Promise<FavoriteDashboard> {
    const id = this.currentFavoriteId++;
    this.favoriteDashboards.add(dashboardId);
    
    return {
      id,
      dashboardId
    };
  }

  async removeFavoriteDashboard(dashboardId: number): Promise<boolean> {
    return this.favoriteDashboards.delete(dashboardId);
  }

  async isFavoriteDashboard(dashboardId: number): Promise<boolean> {
    return this.favoriteDashboards.has(dashboardId);
  }

  // Helper method to initialize sample data
  private initializeSampleDashboards() {
    const dashboardData: InsertDashboard[] = [
      {
        title: "Sales Performance Dashboard",
        description: "Complete overview of sales metrics with real-time data",
        category: "ecom",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=400",
        createdBy: "Analytics Team",
        isFeatured: true
      },
      {
        title: "Financial KPIs Dashboard",
        description: "Track financial performance with interactive charts",
        category: "business",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=400",
        createdBy: "Finance Department",
        isFeatured: true
      },
      {
        title: "Market Analysis Dashboard",
        description: "Competitive analysis and market positioning insights",
        category: "strategy",
        imageUrl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=800&h=400",
        createdBy: "Strategy Team",
        isFeatured: true
      },
      {
        title: "Customer Journey Dashboard",
        description: "Customer acquisition and retention metrics",
        category: "ecom",
        imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=800&h=400",
        createdBy: "Marketing Team",
        isFeatured: false
      },
      {
        title: "Data Pipeline Status",
        description: "Real-time monitoring of data pipelines",
        category: "data",
        imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&h=400",
        createdBy: "Data Engineering",
        isFeatured: false
      },
      {
        title: "HR Performance Metrics",
        description: "Employee performance and engagement",
        category: "business",
        imageUrl: "https://images.unsplash.com/photo-1573496130407-57329f01f769?auto=format&fit=crop&w=800&h=400",
        createdBy: "HR Department",
        isFeatured: false
      },
      {
        title: "Growth Strategy Analytics",
        description: "Future growth projections and scenarios",
        category: "strategy",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=400",
        createdBy: "Executive Team",
        isFeatured: false
      },
      {
        title: "Data Quality Monitoring",
        description: "Track data quality metrics across all sources",
        category: "data",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=400",
        createdBy: "Data Governance",
        isFeatured: true
      },
      {
        title: "Executive Summary",
        description: "High-level business metrics for executive review",
        category: "business",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=400",
        createdBy: "Business Intelligence",
        isFeatured: true
      },
      {
        title: "Conversion Funnel Analysis",
        description: "Detailed breakdown of customer conversion funnel",
        category: "ecom",
        imageUrl: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&h=400",
        createdBy: "Digital Marketing",
        isFeatured: false
      },
      {
        title: "Competitor Benchmark",
        description: "Market position relative to key competitors",
        category: "strategy",
        imageUrl: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=800&h=400",
        createdBy: "Competitive Intelligence",
        isFeatured: false
      },
      {
        title: "ETL Pipeline Monitoring",
        description: "Real-time status of data integration processes",
        category: "data",
        imageUrl: "https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=800&h=400",
        createdBy: "Data Engineering",
        isFeatured: false
      },
      {
        title: "Revenue Forecast",
        description: "Projected revenue based on historical trends",
        category: "business",
        imageUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&w=800&h=400",
        createdBy: "Finance Team",
        isFeatured: false
      },
      {
        title: "Product Performance",
        description: "Sales metrics by product category and SKU",
        category: "ecom",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&h=400",
        createdBy: "Product Management",
        isFeatured: false
      },
      {
        title: "Market Expansion",
        description: "Analysis of potential new market opportunities",
        category: "strategy",
        imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&h=400",
        createdBy: "Growth Team",
        isFeatured: false
      }
    ];

    // Add sample dashboards with varying views
    dashboardData.forEach((dashboardData, index) => {
      const id = this.currentDashboardId++;
      const now = new Date();
      const viewsBase = Math.floor(Math.random() * 5000) + 1000;
      
      const dashboard: Dashboard = {
        ...dashboardData,
        id,
        views: viewsBase,
        createdAt: now,
        updatedAt: now,
        embeddings: null
      };
      
      this.dashboards.set(id, dashboard);
      
      // Add some as recents
      if (index < 4) {
        this.addRecentDashboard(id);
      }
      
      // Add some as favorites
      if (index % 3 === 0) {
        this.favoriteDashboards.add(id);
      }
    });
  }
}

export const storage = new MemStorage();
