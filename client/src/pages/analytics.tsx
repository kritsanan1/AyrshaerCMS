import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Eye, Users, Calendar, Globe } from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: !!isAuthenticated,
  });

  const { data: stats } = useQuery({
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-analytics-title">Analytics</h2>
              <p className="text-gray-600 text-sm">Track your content performance and user engagement</p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-total-views">
                      {(analytics?.length * 127) || 0}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Eye className="text-blue-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-unique-visitors">
                      {Math.floor((analytics?.length * 89) || 0)}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +8% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users className="text-green-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-avg-session">2m 34s</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +15% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Calendar className="text-purple-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-bounce-rate">34.2%</p>
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                      -5% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.articlesCount > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Getting Started with React</p>
                          <p className="text-xs text-gray-500">Article • 2 days ago</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">1,234 views</p>
                          <p className="text-xs text-green-600">+45%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Advanced TypeScript Tips</p>
                          <p className="text-xs text-gray-500">Article • 5 days ago</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">987 views</p>
                          <p className="text-xs text-green-600">+32%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Building Modern UIs</p>
                          <p className="text-xs text-gray-500">Article • 1 week ago</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">756 views</p>
                          <p className="text-xs text-green-600">+28%</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No content analytics available</p>
                      <p className="text-sm text-gray-400">Create content to see performance data</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Direct</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">45.2%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div className="w-[45%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">Search Engines</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">32.8%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div className="w-[33%] h-full bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium">Social Media</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">15.3%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div className="w-[15%] h-full bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="font-medium">Referrals</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">6.7%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div className="w-[7%] h-full bg-yellow-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics && analytics.length > 0 ? (
                <div className="space-y-3">
                  {analytics.slice(0, 10).map((activity, index) => (
                    <div key={activity.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.event} - {activity.resourceType || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.ipAddress}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No activity data available</p>
                  <p className="text-sm text-gray-400">User interactions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
