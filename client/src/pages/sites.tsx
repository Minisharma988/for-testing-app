import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SiteCard from "@/components/site-card";
import SiteModal from "@/components/site-modal";
import type { Site, InsertSite } from "@shared/schema";
import { z } from "zod";

const formSchema = insertSiteSchema.extend({
  pagesToScanText: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Sites() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: sites = [], isLoading } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    refetchInterval: 30000,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      wpCliPath: "/usr/local/bin/wp",
      sshHost: "",
      sshUser: "",
      sshKey: "",
      pagesToScanText: "/,/about,/contact",
    },
  });

  const createSiteMutation = useMutation({
    mutationFn: async (data: InsertSite) => {
      const response = await apiRequest("POST", "/api/sites", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Site added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add site",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const { pagesToScanText, ...siteData } = data;
    const pagesToScan = pagesToScanText
      ? pagesToScanText.split(",").map(page => page.trim()).filter(Boolean)
      : [];

    createSiteMutation.mutate({
      ...siteData,
      pagesToScan,
    });
  };

  const handleViewDetails = (site: Site) => {
    setSelectedSite(site);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>WordPress Sites ({sites.length})</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <i className="fas fa-plus mr-2"></i>Add Site
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New WordPress Site</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My WordPress Site" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sshHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SSH Host</FormLabel>
                            <FormControl>
                              <Input placeholder="example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sshUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SSH User</FormLabel>
                            <FormControl>
                              <Input placeholder="admin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="wpCliPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WP-CLI Path</FormLabel>
                          <FormControl>
                            <Input placeholder="/usr/local/bin/wp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pagesToScanText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pages to Scan (comma-separated)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="/,/about,/contact,/blog"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createSiteMutation.isPending}
                      >
                        {createSiteMutation.isPending ? "Adding..." : "Add Site"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sites.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-globe text-slate-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No sites configured</h3>
              <p className="text-slate-500 mb-6">Add your first WordPress site to get started with maintenance monitoring.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <i className="fas fa-plus mr-2"></i>Add Your First Site
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
