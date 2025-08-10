import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentActivity from "@/components/dashboard/recent-activity";
import AIInsights from "@/components/dashboard/ai-insights";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentContent from "@/components/dashboard/recent-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!isAuthenticated,
  });

  const { data: revenueStats } = useQuery({
    queryKey: ["/api/payments/revenue-stats"],
    enabled: !!isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-dashboard-title">Dashboard</h2>
              <p className="text-gray-600 text-sm">Welcome back! Here's what's happening with your content.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                data-testid="button-notifications"
              >
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                  <img 
                    src={user?.profileImageUrl || "https://via.placeholder.com/40"} 
                    alt="User profile" 
                    className="w-full h-full object-cover"
                    data-testid="img-user-avatar"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <i className="fas fa-fingerprint text-green-500 mr-1"></i>
                    <span>Secure Auth</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          <StatsGrid stats={stats} revenueStats={revenueStats} isLoading={statsLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentActivity />
            <AIInsights />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions />
            <RecentContent />
          </div>

          {/* Language and Payment Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Management Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Multi-Language Content</CardTitle>
                <Button variant="ghost" size="sm" data-testid="button-manage-languages">
                  Manage
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🇺🇸</span>
                    <span className="font-medium">English</span>
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Primary</span>
                  </div>
                  <span className="text-sm text-gray-600" data-testid="text-english-articles">
                    {stats?.articlesCount || 0} articles
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🇪🇸</span>
                    <span className="font-medium">Spanish</span>
                  </div>
                  <span className="text-sm text-gray-600">0 articles</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🇫🇷</span>
                    <span className="font-medium">French</span>
                  </div>
                  <span className="text-sm text-gray-600">0 articles</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-dashed"
                  data-testid="button-add-language"
                >
                  + Add Language
                </Button>
              </CardContent>
            </Card>

            {/* Payment Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Payment Overview</CardTitle>
                <div className="flex items-center space-x-2">
                  <i className="fab fa-stripe text-primary"></i>
                  <span className="text-sm text-gray-600">Stripe Connected</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-month-revenue">
                        ${revenueStats?.thisMonth?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">
                        {revenueStats?.thisMonth > revenueStats?.lastMonth ? '+' : ''}
                        {revenueStats?.thisMonth && revenueStats?.lastMonth 
                          ? Math.round(((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500" data-testid="text-transactions">
                        {revenueStats?.totalTransactions || 0} transactions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm font-medium">Pending Payouts</span>
                  <span className="text-sm text-yellow-600 font-medium">$0.00</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm font-medium">Processing Fees</span>
                  <span className="text-sm text-gray-600">$0.00</span>
                </div>
                <Button className="w-full mt-4" data-testid="button-view-payments">
                  View All Payments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
