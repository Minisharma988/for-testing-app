import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { siteStatusConfig, formatRelativeTime } from "@/lib/types";
import type { Site } from "@shared/schema";

interface SiteCardProps {
  site: Site;
  onViewDetails: (site: Site) => void;
}

export default function SiteCard({ site, onViewDetails }: SiteCardProps) {
  const { toast } = useToast();
  const statusConfig = siteStatusConfig[site.status] || siteStatusConfig.ok;

  const runMaintenanceMutation = useMutation({
    mutationFn: async (siteId: number) => {
      const response = await apiRequest("POST", `/api/maintenance/run/${siteId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Maintenance Started",
        description: `Maintenance workflow started for ${site.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start maintenance",
        variant: "destructive",
      });
    },
  });

  const runBackupMutation = useMutation({
    mutationFn: async (siteId: number) => {
      const response = await apiRequest("POST", `/api/maintenance/backup/${siteId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: "Backup Started",
        description: `Backup started for ${site.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start backup",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-slate-900">{site.name}</h4>
          <p className="text-slate-600 text-sm">{site.url}</p>
        </div>
        <Badge variant="secondary" className={statusConfig.color}>
          <i className={`${statusConfig.icon} text-xs mr-1`}></i>
          {statusConfig.label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-slate-500">Last Backup</p>
          <p className="font-medium text-slate-900">{formatRelativeTime(site.lastBackup)}</p>
        </div>
        <div>
          <p className="text-slate-500">Last Update</p>
          <p className="font-medium text-slate-900">
            {site.lastUpdate ? formatRelativeTime(site.lastUpdate) : "Never"}
          </p>
        </div>
      </div>
      
      {site.pluginUpdateCount > 0 && (
        <div className="mb-3">
          <p className="text-xs text-warning">
            {site.pluginUpdateCount} plugin update{site.pluginUpdateCount !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {site.lastError && (
        <div className="mb-3">
          <p className="text-xs text-error">{site.lastError}</p>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button
          className="flex-1"
          size="sm"
          onClick={() => runMaintenanceMutation.mutate(site.id)}
          disabled={runMaintenanceMutation.isPending || site.status === "updating"}
        >
          <i className="fas fa-cog mr-1"></i>
          {site.status === "updating" ? "Running..." : "Run Maintenance"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(site)}
        >
          <i className="fas fa-eye"></i>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => runBackupMutation.mutate(site.id)}
          disabled={runBackupMutation.isPending}
        >
          <i className="fas fa-cloud-upload-alt"></i>
        </Button>
      </div>
    </div>
  );
}
