import { 
  users, sites, maintenanceLogs, reports, screenshots,
  type User, type InsertUser, 
  type Site, type InsertSite,
  type MaintenanceLog, type InsertMaintenanceLog,
  type Report, type InsertReport,
  type Screenshot, type InsertScreenshot
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Site methods
  getSites(): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, updates: Partial<Site>): Promise<Site | undefined>;
  deleteSite(id: number): Promise<boolean>;

  // Maintenance log methods
  getMaintenanceLogs(siteId?: number): Promise<MaintenanceLog[]>;
  createMaintenanceLog(log: InsertMaintenanceLog): Promise<MaintenanceLog>;
  updateMaintenanceLog(id: number, updates: Partial<MaintenanceLog>): Promise<MaintenanceLog | undefined>;

  // Report methods
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<boolean>;

  // Screenshot methods
  getScreenshots(siteId: number): Promise<Screenshot[]>;
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sites: Map<number, Site>;
  private maintenanceLogs: Map<number, MaintenanceLog>;
  private reports: Map<number, Report>;
  private screenshots: Map<number, Screenshot>;
  private currentUserId: number;
  private currentSiteId: number;
  private currentLogId: number;
  private currentReportId: number;
  private currentScreenshotId: number;

  constructor() {
    this.users = new Map();
    this.sites = new Map();
    this.maintenanceLogs = new Map();
    this.reports = new Map();
    this.screenshots = new Map();
    this.currentUserId = 1;
    this.currentSiteId = 1;
    this.currentLogId = 1;
    this.currentReportId = 1;
    this.currentScreenshotId = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin", // In real app, this would be hashed
      email: "admin@example.com",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo sites
    const demoSites: Site[] = [
      {
        id: this.currentSiteId++,
        name: "Company Website",
        url: "https://company.com",
        status: "ok",
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        lastCheck: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        wpCliPath: "/usr/local/bin/wp",
        sshHost: "company.com",
        sshUser: "admin",
        sshKey: "",
        pagesToScan: ["/", "/about", "/contact"],
        pluginUpdateCount: 0,
        lastError: null,
        createdAt: new Date(),
      },
      {
        id: this.currentSiteId++,
        name: "Blog Platform",
        url: "https://blog.company.com",
        status: "needs_updates",
        lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        lastUpdate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastCheck: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        wpCliPath: "/usr/local/bin/wp",
        sshHost: "blog.company.com",
        sshUser: "admin",
        sshKey: "",
        pagesToScan: ["/", "/blog", "/category/tech"],
        pluginUpdateCount: 5,
        lastError: null,
        createdAt: new Date(),
      },
      {
        id: this.currentSiteId++,
        name: "E-commerce Store",
        url: "https://shop.company.com",
        status: "error",
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        lastUpdate: null,
        lastCheck: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        wpCliPath: "/usr/local/bin/wp",
        sshHost: "shop.company.com",
        sshUser: "admin",
        sshKey: "",
        pagesToScan: ["/", "/shop", "/cart"],
        pluginUpdateCount: 3,
        lastError: "Plugin update failed - conflict detected",
        createdAt: new Date(),
      },
      {
        id: this.currentSiteId++,
        name: "Portfolio Site",
        url: "https://portfolio.company.com",
        status: "ok",
        lastBackup: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastCheck: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        wpCliPath: "/usr/local/bin/wp",
        sshHost: "portfolio.company.com",
        sshUser: "admin",
        sshKey: "",
        pagesToScan: ["/", "/portfolio", "/contact"],
        pluginUpdateCount: 0,
        lastError: null,
        createdAt: new Date(),
      },
    ];

    demoSites.forEach(site => this.sites.set(site.id, site));

    // Create demo maintenance logs
    const demoLogs: MaintenanceLog[] = [
      {
        id: this.currentLogId++,
        siteId: 1,
        type: "backup",
        status: "success",
        message: "Backup completed for Company Website",
        details: { backupSize: "245MB", location: "backblaze-b2://bucket/backup-2024-01-15.zip" },
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
      },
      {
        id: this.currentLogId++,
        siteId: 2,
        type: "update",
        status: "success",
        message: "Plugin updates available for Blog Platform",
        details: { pluginsFound: 5, pluginsUpdated: 5 },
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 10 * 60 * 1000),
      },
      {
        id: this.currentLogId++,
        siteId: 3,
        type: "update",
        status: "error",
        message: "Update failed for E-commerce Store",
        details: { error: "Plugin conflict detected between WooCommerce and Custom Payment Gateway" },
        startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 2 * 60 * 1000),
      },
    ];

    demoLogs.forEach(log => this.maintenanceLogs.set(log.id, log));

    // Create demo reports
    const demoReports: Report[] = [
      {
        id: this.currentReportId++,
        name: "Weekly Maintenance Report",
        type: "weekly",
        description: "All sites maintenance summary",
        filePath: "/reports/weekly-2024-01-15.pdf",
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: this.currentReportId++,
        name: "Backup Status Export",
        type: "backup_status",
        description: "CSV export of all backup statuses",
        filePath: "/reports/backup-status-2024-01-14.csv",
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    demoReports.forEach(report => this.reports.set(report.id, report));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Site methods
  async getSites(): Promise<Site[]> {
    return Array.from(this.sites.values());
  }

  async getSite(id: number): Promise<Site | undefined> {
    return this.sites.get(id);
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const id = this.currentSiteId++;
    const site: Site = {
      ...insertSite,
      id,
      status: "ok",
      lastBackup: null,
      lastUpdate: null,
      lastCheck: null,
      pluginUpdateCount: 0,
      lastError: null,
      createdAt: new Date(),
    };
    this.sites.set(id, site);
    return site;
  }

  async updateSite(id: number, updates: Partial<Site>): Promise<Site | undefined> {
    const site = this.sites.get(id);
    if (!site) return undefined;
    
    const updatedSite = { ...site, ...updates };
    this.sites.set(id, updatedSite);
    return updatedSite;
  }

  async deleteSite(id: number): Promise<boolean> {
    return this.sites.delete(id);
  }

  // Maintenance log methods
  async getMaintenanceLogs(siteId?: number): Promise<MaintenanceLog[]> {
    const logs = Array.from(this.maintenanceLogs.values());
    if (siteId) {
      return logs.filter(log => log.siteId === siteId);
    }
    return logs.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async createMaintenanceLog(insertLog: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const id = this.currentLogId++;
    const log: MaintenanceLog = {
      ...insertLog,
      id,
      startedAt: new Date(),
      completedAt: null,
    };
    this.maintenanceLogs.set(id, log);
    return log;
  }

  async updateMaintenanceLog(id: number, updates: Partial<MaintenanceLog>): Promise<MaintenanceLog | undefined> {
    const log = this.maintenanceLogs.get(id);
    if (!log) return undefined;
    
    const updatedLog = { ...log, ...updates };
    this.maintenanceLogs.set(id, updatedLog);
    return updatedLog;
  }

  // Report methods
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const report: Report = {
      ...insertReport,
      id,
      generatedAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    return this.reports.delete(id);
  }

  // Screenshot methods
  async getScreenshots(siteId: number): Promise<Screenshot[]> {
    return Array.from(this.screenshots.values())
      .filter(screenshot => screenshot.siteId === siteId)
      .sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
  }

  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const id = this.currentScreenshotId++;
    const screenshot: Screenshot = {
      ...insertScreenshot,
      id,
      takenAt: new Date(),
    };
    this.screenshots.set(id, screenshot);
    return screenshot;
  }
}

export const storage = new MemStorage();
