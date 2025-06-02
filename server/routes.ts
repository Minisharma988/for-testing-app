import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSiteSchema, insertMaintenanceLogSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check auth status
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  });

  // Sites endpoints
  app.get("/api/sites", requireAuth, async (req, res) => {
    try {
      const sites = await storage.getSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.get("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const site = await storage.getSite(id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site" });
    }
  });

  app.post("/api/sites", requireAuth, async (req, res) => {
    try {
      const siteData = insertSiteSchema.parse(req.body);
      const site = await storage.createSite(siteData);
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid site data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create site" });
    }
  });

  app.put("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const site = await storage.updateSite(id, updates);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site" });
    }
  });

  app.delete("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSite(id);
      if (!deleted) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete site" });
    }
  });

  // Maintenance endpoints
  app.post("/api/maintenance/run/:siteId", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }

      // Create maintenance log
      const log = await storage.createMaintenanceLog({
        siteId,
        type: "full_maintenance",
        status: "in_progress",
        message: `Starting full maintenance for ${site.name}`,
        details: { steps: ["backup", "screenshot", "update", "comparison"] },
      });

      // Simulate maintenance workflow
      setTimeout(async () => {
        try {
          // Update site status
          await storage.updateSite(siteId, {
            status: "updating",
            lastCheck: new Date(),
          });

          // Simulate backup
          await new Promise(resolve => setTimeout(resolve, 2000));
          await storage.createMaintenanceLog({
            siteId,
            type: "backup",
            status: "success",
            message: "Backup completed successfully",
            details: { backupSize: "150MB", location: "backblaze-b2://bucket/backup.zip" },
          });

          // Simulate screenshot
          await new Promise(resolve => setTimeout(resolve, 1000));
          await storage.createMaintenanceLog({
            siteId,
            type: "screenshot",
            status: "success",
            message: "Pre-update screenshots captured",
            details: { pages: site.pagesToScan },
          });

          // Simulate plugin updates
          await new Promise(resolve => setTimeout(resolve, 3000));
          const updateSuccess = Math.random() > 0.3; // 70% success rate
          
          if (updateSuccess) {
            await storage.createMaintenanceLog({
              siteId,
              type: "update",
              status: "success",
              message: "Plugin updates completed successfully",
              details: { pluginsUpdated: site.pluginUpdateCount || 0 },
            });

            await storage.updateSite(siteId, {
              status: "ok",
              lastUpdate: new Date(),
              pluginUpdateCount: 0,
              lastError: null,
            });
          } else {
            await storage.createMaintenanceLog({
              siteId,
              type: "update",
              status: "error",
              message: "Plugin update failed",
              details: { error: "Plugin conflict detected" },
            });

            await storage.updateSite(siteId, {
              status: "error",
              lastError: "Plugin update failed - conflict detected",
            });
          }

          // Complete maintenance log
          await storage.updateMaintenanceLog(log.id, {
            status: updateSuccess ? "success" : "error",
            message: updateSuccess ? "Maintenance completed successfully" : "Maintenance completed with errors",
            completedAt: new Date(),
          });

        } catch (error) {
          await storage.updateMaintenanceLog(log.id, {
            status: "error",
            message: "Maintenance failed due to system error",
            completedAt: new Date(),
          });
        }
      }, 100);

      res.json({ message: "Maintenance started", logId: log.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to start maintenance" });
    }
  });

  app.post("/api/maintenance/backup/:siteId", requireAuth, async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }

      const log = await storage.createMaintenanceLog({
        siteId,
        type: "backup",
        status: "in_progress",
        message: `Starting backup for ${site.name}`,
        details: {},
      });

      // Simulate backup process
      setTimeout(async () => {
        await storage.updateMaintenanceLog(log.id, {
          status: "success",
          message: "Backup completed successfully",
          completedAt: new Date(),
          details: { backupSize: "200MB", location: "backblaze-b2://bucket/backup.zip" },
        });

        await storage.updateSite(siteId, {
          lastBackup: new Date(),
        });
      }, 2000);

      res.json({ message: "Backup started", logId: log.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to start backup" });
    }
  });

  // Logs endpoints
  app.get("/api/logs", requireAuth, async (req, res) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const logs = await storage.getMaintenanceLogs(siteId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Reports endpoints
  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports/generate", requireAuth, async (req, res) => {
    try {
      const { name, type, description } = req.body;
      
      const report = await storage.createReport({
        name,
        type,
        description,
        filePath: `/reports/${type}-${Date.now()}.pdf`,
      });

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const sites = await storage.getSites();
      const logs = await storage.getMaintenanceLogs();
      
      const stats = {
        totalSites: sites.length,
        sitesOk: sites.filter(site => site.status === "ok").length,
        needUpdates: sites.filter(site => site.status === "needs_updates").length,
        errors: sites.filter(site => site.status === "error").length,
        recentActivity: logs.slice(0, 10).map(log => ({
          id: log.id,
          message: log.message,
          status: log.status,
          timestamp: log.startedAt,
        })),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
