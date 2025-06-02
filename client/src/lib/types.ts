export interface DashboardStats {
  totalSites: number;
  sitesOk: number;
  needUpdates: number;
  errors: number;
  recentActivity: Array<{
    id: number;
    message: string;
    status: string;
    timestamp: Date;
  }>;
}

export interface SiteStatus {
  ok: string;
  error: string;
  updating: string;
  needs_updates: string;
}

export const siteStatusConfig: Record<string, { color: string; icon: string; label: string }> = {
  ok: { color: "text-success bg-success/10", icon: "fas fa-check-circle", label: "OK" },
  error: { color: "text-error bg-error/10", icon: "fas fa-times-circle", label: "Error" },
  updating: { color: "text-primary bg-primary/10", icon: "fas fa-sync-alt", label: "Updating" },
  needs_updates: { color: "text-warning bg-warning/10", icon: "fas fa-exclamation-triangle", label: "Updates" },
};

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Never";
  
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return target.toLocaleDateString();
}
