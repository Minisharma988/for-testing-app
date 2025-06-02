import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { siteStatusConfig, formatRelativeTime } from "@/lib/types";
import type { Site, MaintenanceLog } from "@shared/schema";

interface SiteModalProps {
  site: Site | null;
  open: boolean;
  onClose: () => void;
}

export default function SiteModal({ site, open, onClose }: SiteModalProps) {
  const { toast } = useToast();

  const { data: logs = [] } = useQuery<MaintenanceLog[]>({
    queryKey: ["/api/logs", { siteId: site?.id }],
    enabled: !!site?.id && open,
  });

  const runMaintenanceMutation = useMutation({
    mutationFn: async (siteId: number) => {
      const response = await apiRequest("POST", `/api/maintenance/run/${siteId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Maintenance Started",
        description: `Maintenance workflow started for ${site?.name}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start maintenance",
        variant: "destructive",
      });
    },
  });

  if (!site) return null;

  const statusConfig = siteStatusConfig[site.status] || siteStatusConfig.ok;
  const recentLogs = logs.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Site Details: {site.name}</span>
            <Badge variant="secondary" className={statusConfig.color}>
              <i className={`${statusConfig.icon} text-xs mr-1`}></i>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Site Configuration */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Site Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50">
                  {site.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site URL</label>
                <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50">
                  {site.url}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SSH Host</label>
                <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50">
                  {site.sshHost || "Not configured"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">WP-CLI Path</label>
                <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50">
                  {site.wpCliPath || "Not configured"}
                </div>
              </div>
            </div>
          </div>

          {/* Site Statistics */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Site Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Last Backup</p>
                <p className="font-medium text-slate-900">{formatRelativeTime(site.lastBackup)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Last Update</p>
                <p className="font-medium text-slate-900">
                  {site.lastUpdate ? formatRelativeTime(site.lastUpdate) : "Never"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Plugin Updates Available</p>
                <p className="font-medium text-slate-900">{site.pluginUpdateCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Pages to Scan */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Pages to Scan</h4>
            <div className="flex flex-wrap gap-2">
              {site.pagesToScan?.map((page, index) => (
                <Badge key={index} variant="outline">
                  {page}
                </Badge>
              )) || (
                <p className="text-slate-500 text-sm">No pages configured</p>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Recent Maintenance History</h4>
            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        log.status === "success" ? "bg-success/10" :
                        log.status === "error" ? "bg-error/10" :
                        "bg-primary/10"
                      }`}>
                        <i className={`text-sm ${
                          log.status === "success" ? "fas fa-check text-success" :
                          log.status === "error" ? "fas fa-times text-error" :
                          "fas fa-clock text-primary"
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{log.type.replace("_", " ").toUpperCase()}</p>
                        <p className="text-sm text-slate-600">{log.message}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{formatRelativeTime(log.startedAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No maintenance history available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => site && runMaintenanceMutation.mutate(site.id)}
            disabled={runMaintenanceMutation.isPending || site.status === "updating"}
          >
            <i className="fas fa-cog mr-2"></i>
            {site.status === "updating" ? "Running..." : "Run Maintenance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
