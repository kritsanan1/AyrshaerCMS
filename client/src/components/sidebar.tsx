import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Ungroup, 
  LayoutDashboard, 
  FileText, 
  Images, 
  Box, 
  BarChart3, 
  Brain, 
  CreditCard, 
  Globe, 
  Settings,
  Crown
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Articles", href: "/articles", icon: FileText, badge: "articles" },
  { name: "Media Library", href: "/media", icon: Images, badge: "media" },
  { name: "Products", href: "/products", icon: Box, badge: "products" },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Tools", href: "/ai-tools", icon: Brain, isNew: true },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Languages", href: "/languages", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex-shrink-0 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Ungroup className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900" data-testid="text-logo">Ayrshaer</h1>
            <p className="text-xs text-gray-500">Content Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {item.isNew && (
                <span className="ml-auto bg-secondary text-white text-xs px-2 py-1 rounded-full">
                  New
                </span>
              )}
              {item.badge && (
                <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  0
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Plan */}
      <div className="p-4 border-t border-gray-200">
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-center space-x-3">
            <Crown className="text-yellow-300" />
            <div className="flex-1">
              <p className="text-sm font-medium" data-testid="text-plan-status">
                {user?.plan === 'premium' ? 'Premium Plan' : 'Free Plan'}
              </p>
              <p className="text-xs opacity-90">
                {user?.plan === 'premium' ? 'Enjoying premium features' : 'Upgrade for more features'}
              </p>
            </div>
            {user?.plan !== 'premium' && (
              <Button
                size="sm"
                variant="secondary"
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30"
                data-testid="button-upgrade"
              >
                Upgrade
              </Button>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full mt-3 text-gray-600"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
