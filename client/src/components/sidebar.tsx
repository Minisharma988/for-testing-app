import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { path: "/sites", label: "Sites", icon: "fas fa-globe" },
    { path: "/logs", label: "Logs & Reports", icon: "fas fa-file-alt" },
    { path: "/settings", label: "Settings", icon: "fas fa-cog" },
  ];

  const quickActions = [
    { label: "Run All Maintenance", icon: "fas fa-play-circle" },
    { label: "Backup All Sites", icon: "fas fa-cloud-upload-alt" },
  ];

  return (
    <aside className={cn(
      "w-64 bg-slate-900 text-white flex-shrink-0 transition-transform duration-300",
      "lg:block lg:translate-x-0",
      isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "hidden lg:block"
    )}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold">WP Maintenance</h1>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-6 mb-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Main</p>
        </div>
        
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center px-6 py-3 transition-colors",
                isActive
                  ? "text-white bg-slate-800 border-r-2 border-primary"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              )}
            >
              <i className={cn(item.icon, "w-5 h-5 mr-3")}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <div className="px-6 mt-8 mb-6">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Quick Actions</p>
        </div>
        
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="flex items-center px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors w-full text-left"
          >
            <i className={cn(action.icon, "w-5 h-5 mr-3")}></i>
            <span>{action.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
