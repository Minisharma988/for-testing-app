import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Backblaze B2 Settings
    b2KeyId: "",
    b2ApplicationKey: "",
    b2BucketName: "",
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    emailFrom: "",
    emailTo: "",
    
    // Schedule Settings
    autoMaintenance: false,
    frequency: "weekly",
    time: "02:00",
    timezone: "UTC-8",
    
    // General Settings
    screenshotComparison: true,
    backupRetention: "30",
    maxConcurrentJobs: "3",
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      b2KeyId: "",
      b2ApplicationKey: "",
      b2BucketName: "",
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUser: "",
      smtpPassword: "",
      emailFrom: "",
      emailTo: "",
      autoMaintenance: false,
      frequency: "weekly",
      time: "02:00",
      timezone: "UTC-8",
      screenshotComparison: true,
      backupRetention: "30",
      maxConcurrentJobs: "3",
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Backblaze B2 Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-cloud text-primary mr-2"></i>
            Backblaze B2 Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="b2KeyId">Application Key ID</Label>
              <Input
                id="b2KeyId"
                type="text"
                placeholder="Enter key ID"
                value={settings.b2KeyId}
                onChange={(e) => setSettings({ ...settings, b2KeyId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="b2ApplicationKey">Application Key</Label>
              <Input
                id="b2ApplicationKey"
                type="password"
                placeholder="Enter application key"
                value={settings.b2ApplicationKey}
                onChange={(e) => setSettings({ ...settings, b2ApplicationKey: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="b2BucketName">Bucket Name</Label>
            <Input
              id="b2BucketName"
              type="text"
              placeholder="Enter bucket name"
              value={settings.b2BucketName}
              onChange={(e) => setSettings({ ...settings, b2BucketName: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-envelope text-primary mr-2"></i>
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Server</Label>
              <Input
                id="smtpHost"
                type="text"
                placeholder="smtp.gmail.com"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                placeholder="587"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                type="text"
                placeholder="your-email@gmail.com"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                placeholder="Your app password"
                value={settings.smtpPassword}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emailFrom">From Email</Label>
              <Input
                id="emailFrom"
                type="email"
                placeholder="maintenance@yourcompany.com"
                value={settings.emailFrom}
                onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emailTo">Alert Recipients</Label>
              <Input
                id="emailTo"
                type="text"
                placeholder="admin@yourcompany.com, dev@yourcompany.com"
                value={settings.emailTo}
                onChange={(e) => setSettings({ ...settings, emailTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-clock text-primary mr-2"></i>
            Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="auto-maintenance"
              checked={settings.autoMaintenance}
              onCheckedChange={(checked) => setSettings({ ...settings, autoMaintenance: checked })}
            />
            <Label htmlFor="auto-maintenance" className="font-medium">
              Enable automatic maintenance
            </Label>
          </div>
          
          {settings.autoMaintenance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={settings.frequency} onValueChange={(value) => setSettings({ ...settings, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={settings.time}
                  onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                    <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                    <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                    <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-cogs text-primary mr-2"></i>
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="screenshot-comparison"
              checked={settings.screenshotComparison}
              onCheckedChange={(checked) => setSettings({ ...settings, screenshotComparison: checked })}
            />
            <Label htmlFor="screenshot-comparison" className="font-medium">
              Enable screenshot comparison
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupRetention">Backup Retention (days)</Label>
              <Input
                id="backupRetention"
                type="number"
                min="1"
                max="365"
                value={settings.backupRetention}
                onChange={(e) => setSettings({ ...settings, backupRetention: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxConcurrentJobs">Max Concurrent Jobs</Label>
              <Input
                id="maxConcurrentJobs"
                type="number"
                min="1"
                max="10"
                value={settings.maxConcurrentJobs}
                onChange={(e) => setSettings({ ...settings, maxConcurrentJobs: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleReset}>
          <i className="fas fa-undo mr-2"></i>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <i className="fas fa-save mr-2"></i>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
