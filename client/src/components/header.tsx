import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getPageTitle = () => {
    switch (location) {
      case "/":
        return { title: "Dashboard", subtitle: "Manage your WordPress sites maintenance" };
      case "/sites":
        return { title: "Sites", subtitle: "Configure and monitor your WordPress sites" };
      case "/logs":
        return { title: "Logs & Reports", subtitle: "View maintenance logs and download reports" };
      case "/settings":
        return { title: "Settings", subtitle: "Configure system settings and preferences" };
      default:
        return { title: "Dashboard", subtitle: "Manage your WordPress sites maintenance" };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-4 text-slate-500 hover:text-slate-700"
            onClick={onMobileMenuToggle}
          >
            <i className="fas fa-bars text-xl"></i>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 text-sm">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-slate-400 hover:text-slate-600">
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">3</span>
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.username || "Admin User"}</p>
              <p className="text-xs text-slate-500">{user?.email || "admin@example.com"}</p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-slate-400 hover:text-slate-600"
            >
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
