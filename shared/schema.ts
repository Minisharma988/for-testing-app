import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull().default("ok"), // ok, error, updating, needs_updates
  lastBackup: timestamp("last_backup"),
  lastUpdate: timestamp("last_update"),
  lastCheck: timestamp("last_check"),
  wpCliPath: text("wp_cli_path"),
  sshHost: text("ssh_host"),
  sshUser: text("ssh_user"),
  sshKey: text("ssh_key"),
  pagesToScan: json("pages_to_scan").$type<string[]>().default([]),
  pluginUpdateCount: integer("plugin_update_count").default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  type: text("type").notNull(), // backup, update, screenshot, comparison
  status: text("status").notNull(), // success, error, in_progress
  message: text("message").notNull(),
  details: json("details").$type<Record<string, any>>(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // weekly, monthly, error_summary, backup_status
  description: text("description"),
  filePath: text("file_path"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const screenshots = pgTable("screenshots", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  page: text("page").notNull(),
  beforePath: text("before_path"),
  afterPath: text("after_path"),
  comparisonResult: json("comparison_result").$type<{
    differences: number;
    threshold: number;
    passed: boolean;
  }>(),
  takenAt: timestamp("taken_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertSiteSchema = createInsertSchema(sites).pick({
  name: true,
  url: true,
  wpCliPath: true,
  sshHost: true,
  sshUser: true,
  sshKey: true,
  pagesToScan: true,
});

export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLogs).pick({
  siteId: true,
  type: true,
  status: true,
  message: true,
  details: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  name: true,
  type: true,
  description: true,
  filePath: true,
});

export const insertScreenshotSchema = createInsertSchema(screenshots).pick({
  siteId: true,
  page: true,
  beforePath: true,
  afterPath: true,
  comparisonResult: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;
