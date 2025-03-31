import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model remains the same as it might be needed for authentication later
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define an enum for dashboard categories
export const categoryEnum = pgEnum("category", ["data", "business", "ecom", "strategy"]);

// Dashboard model for storing dashboard metadata
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  imageUrl: text("imageUrl").notNull(),
  createdBy: text("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  embeddings: text("embeddings"), // Stored as a JSON string of vector embeddings
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  embeddings: true,
});

// Recently viewed dashboard model
export const recentDashboards = pgTable("recentDashboards", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboardId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  // Could add userId for a personalized experience in the future
});

export const insertRecentDashboardSchema = createInsertSchema(recentDashboards).omit({
  id: true,
  viewedAt: true,
});

// For favorites functionality
export const favoriteDashboards = pgTable("favoriteDashboards", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboardId").notNull(),
  // Could add userId for a personalized experience in the future
});

export const insertFavoriteDashboardSchema = createInsertSchema(favoriteDashboards).omit({
  id: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertRecentDashboard = z.infer<typeof insertRecentDashboardSchema>;
export type RecentDashboard = typeof recentDashboards.$inferSelect;

export type InsertFavoriteDashboard = z.infer<typeof insertFavoriteDashboardSchema>;
export type FavoriteDashboard = typeof favoriteDashboards.$inferSelect;

// Enum for categories as TypeScript type
export type Category = "data" | "business" | "ecom" | "strategy";

// Query schema for search functionality
export const searchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(5),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Schema for dashboard with category subtypes
export const dashboardWithCategorySchema = createInsertSchema(dashboards).extend({
  category: z.enum(["data", "business", "ecom", "strategy"]),
});

// Result schema for embeddings search
export const searchResultSchema = z.object({
  dashboards: z.array(z.object({
    dashboard: dashboardWithCategorySchema.omit({ embeddings: true }),
    similarity: z.number(),
  })),
});

export type SearchResult = z.infer<typeof searchResultSchema>;
