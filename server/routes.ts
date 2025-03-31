import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { embeddingService } from "./embedding";
import { z } from "zod";
import {
  searchQuerySchema,
  insertDashboardSchema,
  insertFavoriteDashboardSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize embeddings for dashboards
  const initializeEmbeddings = async () => {
    try {
      const dashboards = await storage.getAllDashboards();
      
      for (const dashboard of dashboards) {
        if (!dashboard.embeddings) {
          const embedding = embeddingService.generateDashboardEmbedding(dashboard);
          await storage.updateDashboardEmbeddings(dashboard.id, embedding);
        }
      }
      
      console.log("Embeddings initialized for all dashboards");
    } catch (error) {
      console.error("Error initializing embeddings:", error);
    }
  };
  
  // Call initialization right away
  await initializeEmbeddings();

  // GET all dashboards
  app.get("/api/dashboards", async (req: Request, res: Response) => {
    try {
      const dashboards = await storage.getAllDashboards();
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboards" });
    }
  });

  // GET dashboard by ID
  app.get("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      const dashboard = await storage.getDashboardById(id);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Increment views and add to recent dashboards
      await storage.incrementDashboardViews(id);
      await storage.addRecentDashboard(id);
      
      const isFavorite = await storage.isFavoriteDashboard(id);
      
      res.json({ ...dashboard, isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard" });
    }
  });

  // GET dashboards by category
  app.get("/api/dashboards/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category as any;
      const validCategories = ["data", "business", "ecom", "strategy"];
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      
      const dashboards = await storage.getDashboardsByCategory(category);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboards by category" });
    }
  });

  // GET featured dashboards
  app.get("/api/dashboards/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const dashboards = await storage.getFeaturedDashboards(limit);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured dashboards" });
    }
  });

  // GET recent dashboards
  app.get("/api/dashboards/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const dashboards = await storage.getRecentDashboards(limit);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent dashboards" });
    }
  });

  // POST search dashboards using embeddings
  app.post("/api/dashboards/search", async (req: Request, res: Response) => {
    try {
      const validatedQuery = searchQuerySchema.safeParse(req.body);
      
      if (!validatedQuery.success) {
        return res.status(400).json({ message: "Invalid search query", errors: validatedQuery.error.format() });
      }
      
      const { query, limit } = validatedQuery.data;
      
      // Get all dashboard embeddings
      const dashboardsWithEmbeddings = await storage.getDashboardEmbeddings();
      
      // Find similar dashboards using embeddings
      const similarDashboards = embeddingService.findSimilarDashboards(
        query, 
        dashboardsWithEmbeddings,
        limit
      );
      
      // Fetch full dashboard data for the similar dashboards
      const results = await Promise.all(
        similarDashboards.map(async ({ dashboardId, similarity }) => {
          const dashboard = await storage.getDashboardById(dashboardId);
          return { dashboard, similarity };
        })
      );
      
      // Filter out any undefined dashboards (though there shouldn't be any)
      const filteredResults = results.filter(result => result.dashboard !== undefined);
      
      res.json({ dashboards: filteredResults });
    } catch (error) {
      res.status(500).json({ message: "Error searching dashboards" });
    }
  });

  // POST create dashboard
  app.post("/api/dashboards", async (req: Request, res: Response) => {
    try {
      const validatedDashboard = insertDashboardSchema.safeParse(req.body);
      
      if (!validatedDashboard.success) {
        return res.status(400).json({ message: "Invalid dashboard data", errors: validatedDashboard.error.format() });
      }
      
      const dashboard = await storage.createDashboard(validatedDashboard.data);
      
      // Generate and store embeddings for the new dashboard
      const embedding = embeddingService.generateDashboardEmbedding(dashboard);
      await storage.updateDashboardEmbeddings(dashboard.id, embedding);
      
      res.status(201).json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Error creating dashboard" });
    }
  });

  // PUT update dashboard
  app.put("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      const validatedDashboard = insertDashboardSchema.partial().safeParse(req.body);
      
      if (!validatedDashboard.success) {
        return res.status(400).json({ message: "Invalid dashboard data", errors: validatedDashboard.error.format() });
      }
      
      const updatedDashboard = await storage.updateDashboard(id, validatedDashboard.data);
      
      if (!updatedDashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Regenerate embeddings if title or description changed
      if (req.body.title || req.body.description) {
        const embedding = embeddingService.generateDashboardEmbedding(updatedDashboard);
        await storage.updateDashboardEmbeddings(id, embedding);
      }
      
      res.json(updatedDashboard);
    } catch (error) {
      res.status(500).json({ message: "Error updating dashboard" });
    }
  });

  // DELETE dashboard
  app.delete("/api/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      const success = await storage.deleteDashboard(id);
      
      if (!success) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting dashboard" });
    }
  });

  // POST add to favorites
  app.post("/api/dashboards/favorite", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFavoriteDashboardSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid favorite data", errors: validatedData.error.format() });
      }
      
      const { dashboardId } = validatedData.data;
      
      // Check if dashboard exists
      const dashboard = await storage.getDashboardById(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check if already favorited
      const isFavorite = await storage.isFavoriteDashboard(dashboardId);
      if (isFavorite) {
        return res.status(400).json({ message: "Dashboard already in favorites" });
      }
      
      const favorite = await storage.addFavoriteDashboard(dashboardId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Error adding dashboard to favorites" });
    }
  });

  // DELETE remove from favorites
  app.delete("/api/dashboards/favorite/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      // Check if dashboard exists
      const dashboard = await storage.getDashboardById(id);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check if favorited
      const isFavorite = await storage.isFavoriteDashboard(id);
      if (!isFavorite) {
        return res.status(400).json({ message: "Dashboard not in favorites" });
      }
      
      const success = await storage.removeFavoriteDashboard(id);
      
      if (!success) {
        return res.status(500).json({ message: "Error removing dashboard from favorites" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing dashboard from favorites" });
    }
  });

  // GET favorite dashboards
  app.get("/api/dashboards/favorites", async (req: Request, res: Response) => {
    try {
      const dashboards = await storage.getFavoriteDashboards();
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorite dashboards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
