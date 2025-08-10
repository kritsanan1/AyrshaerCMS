import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Plus, Upload, ShoppingCart, Brain } from "lucide-react";

export default function RecentActivity() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: true,
  });

  // Mock recent activities for demo
  const recentActivities = [
    {
      id: 1,
      type: "article",
      title: "New article published",
      description: "Your latest content is now live",
      time: "2 hours ago",
      icon: Plus,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      type: "media",
      title: "Media files uploaded",
      description: "15 new images added to library",
      time: "4 hours ago",
      icon: Upload,
      iconBg: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      id: 3,
      type: "product",
      title: "Product updated",
      description: "Pricing updated for premium template",
      time: "6 hours ago",
      icon: ShoppingCart,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      id: 4,
      type: "ai",
      title: "AI insights generated",
      description: "New content recommendations available",
      time: "8 hours ago",
      icon: Brain,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600"
    }
  ];

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4 p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <div 
                key={activity.id}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                data-testid={`activity-${activity.type}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                  <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
          
          {recentActivities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">
                Start creating content to see your activity here
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
