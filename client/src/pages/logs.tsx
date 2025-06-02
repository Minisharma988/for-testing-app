import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/types";
import type { MaintenanceLog, Report, Site } from "@shared/schema";

export default function Logs() {
  const [selectedSiteId, setSelectedSiteId] = useState<string>("all");
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  const { data: logs = [] } = useQuery<MaintenanceLog[]>({
    queryKey: ["/api/logs", selectedSiteId !== "all" ? { siteId: parseInt(selectedSiteId) } : {}],
    refetchInterval: 5000,
  });

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: { name: string; type: string; description: string }) => {
      const response = await apiRequest("POST", "/api/reports/generate", reportData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  // Simulate live logs
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const messages = [
        { level: 'INFO', color: 'text-green-400', text: 'Checking for plugin updates...' },
        { level: 'DEBUG', color: 'text-blue-400', text: 'Connecting to WordPress API...' },
        { level: 'WARN', color: 'text-yellow-400', text: 'Plugin update available detected' },
        { level: 'INFO', color: 'text-green-400', text: 'Backup process completed' },
        { level: 'ERROR', color: 'text-red-400', text: 'Failed to connect to remote server' },
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const logEntry = `[${timestamp}] ${randomMessage.level}: ${randomMessage.text}`;
      
      setLiveLogs(prev => {
        const newLogs = [logEntry, ...prev.slice(0, 19)];
        return newLogs;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSiteName = (siteId: number) => {
    const site = sites.find(s => s.id === siteId);
    return site?.name || `Site ${siteId}`;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      success: { color: "bg-success/10 text-success", icon: "fas fa-check" },
      error: { color: "bg-error/10 text-error", icon: "fas fa-times" },
      in_progress: { color: "bg-primary/10 text-primary", icon: "fas fa-clock" },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.in_progress;
    
    return (
      <Badge variant="secondary" className={statusConfig.color}>
        <i className={`${statusConfig.icon} text-xs mr-1`}></i>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "weekly":
      case "monthly":
        return "fas fa-file-pdf text-primary";
      case "backup_status":
        return "fas fa-file-csv text-success";
      case "error_summary":
        return "fas fa-file-alt text-warning";
      default:
        return "fas fa-file text-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Reports & Downloads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports & Downloads</CardTitle>
            <Button
              onClick={() => generateReportMutation.mutate({
                name: "Weekly Maintenance Report",
                type: "weekly",
                description: "Comprehensive maintenance report for all sites"
              })}
              disabled={generateReportMutation.isPending}
            >
              <i className="fas fa-plus mr-2"></i>
              {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className={getReportIcon(report.type)}></i>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatRelativeTime(report.generatedAt)}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-900 mb-2">{report.name}</h4>
                  <p className="text-sm text-slate-600 mb-4">{report.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => toast({
                      title: "Download Started",
                      description: `Downloading ${report.name}`,
                    })}
                  >
                    <i className="fas fa-download mr-2"></i>Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-file-alt text-slate-300 text-4xl mb-4"></i>
              <p className="text-slate-500">No reports generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maintenance Logs</CardTitle>
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id.toString()}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
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
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-slate-900">
                            {log.type.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600">{getSiteName(log.siteId)}</span>
                        </div>
                        <p className="text-slate-700">{log.message}</p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 text-xs text-slate-500">
                            <details>
                              <summary className="cursor-pointer hover:text-slate-700">
                                View details
                              </summary>
                              <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(log.status)}
                      <p className="text-xs text-slate-500 mt-1">
                        {formatRelativeTime(log.startedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-list text-slate-300 text-4xl mb-4"></i>
                <p className="text-slate-500">No maintenance logs found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Logs</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLiveLogs([])}
              >
                <i className="fas fa-trash mr-1"></i>Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({
                  title: "Export Started",
                  description: "Exporting live logs to file",
                })}
              >
                <i className="fas fa-download mr-1"></i>Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
            <div className="space-y-1 text-slate-300">
              {liveLogs.length > 0 ? (
                liveLogs.map((log, index) => (
                  <div key={index} className="text-green-400">{log}</div>
                ))
              ) : (
                <div className="text-slate-400">No live logs available. Logs will appear here when maintenance tasks are running.</div>
              )}
              <div className="text-slate-400">_</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
