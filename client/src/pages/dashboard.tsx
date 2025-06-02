import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SiteCard from "@/components/site-card";
import SiteModal from "@/components/site-modal";
import { formatRelativeTime } from "@/lib/types";
import { useState } from "react";
import type { Site } from "@shared/schema";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    refetchInterval: 30000,
  });

  const handleViewDetails = (site: Site) => {
    setSelectedSite(site);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Sites</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalSites || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-globe text-primary text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Sites OK</p>
                <p className="text-3xl font-bold text-success">{stats?.sitesOk || 0}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-success text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Need Updates</p>
                <p className="text-3xl font-bold text-warning">{stats?.needUpdates || 0}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-warning text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Errors</p>
                <p className="text-3xl font-bold text-error">{stats?.errors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-times-circle text-error text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center justify-center">
              <i className="fas fa-play-circle mr-2"></i>
              Run All Maintenance
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <i className="fas fa-cloud-upload-alt mr-2"></i>
              Backup All Sites
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <i className="fas fa-file-download mr-2"></i>
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>WordPress Sites</CardTitle>
            <Button>
              <i className="fas fa-plus mr-2"></i>Add Site
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.status === "success" ? "bg-success/10" :
                  activity.status === "error" ? "bg-error/10" :
                  "bg-warning/10"
                }`}>
                  <i className={`text-sm ${
                    activity.status === "success" ? "fas fa-check text-success" :
                    activity.status === "error" ? "fas fa-times text-error" :
                    "fas fa-exclamation text-warning"
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium">{activity.message}</p>
                  <p className="text-slate-500 text-sm">{formatRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            )) || (
              <p className="text-slate-500 text-sm">No recent activity</p>
            )}
          </div>
          
          {stats?.recentActivity && stats.recentActivity.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="link" className="text-primary hover:text-blue-700">
                View All Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SiteModal
        site={selectedSite}
        open={!!selectedSite}
        onClose={() => setSelectedSite(null)}
      />
    </div>
  );
}
