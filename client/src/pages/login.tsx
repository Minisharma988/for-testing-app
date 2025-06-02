import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  
  const { login, isLoginPending } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(credentials);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">WP Maintenance</CardTitle>
          <p className="text-slate-600 text-center">Sign in to your maintenance dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoginPending}
            >
              {isLoginPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Demo credentials:</p>
            <p className="text-sm font-mono">Username: admin</p>
            <p className="text-sm font-mono">Password: admin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
