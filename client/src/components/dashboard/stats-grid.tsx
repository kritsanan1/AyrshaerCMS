import { Card, CardContent } from "@/components/ui/card";
import { FileText, Images, Box, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface StatsGridProps {
  stats?: {
    articlesCount: number;
    mediaCount: number;
    productsCount: number;
    totalRevenue: number;
  };
  revenueStats?: {
    thisMonth: number;
    lastMonth: number;
  };
  isLoading: boolean;
}

export default function StatsGrid({ stats, revenueStats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Articles",
      value: stats?.articlesCount || 0,
      growth: "+12% this month", // Mock growth for demo
      isPositive: true,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      testId: "stat-articles"
    },
    {
      title: "Media Files",
      value: stats?.mediaCount || 0,
      growth: "+8% this month",
      isPositive: true,
      icon: Images,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      testId: "stat-media"
    },
    {
      title: "Products",
      value: stats?.productsCount || 0,
      growth: stats?.productsCount > 0 ? "+5% this month" : "No change",
      isPositive: stats?.productsCount > 0,
      icon: Box,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      testId: "stat-products"
    },
    {
      title: "Revenue",
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      growth: revenueStats?.thisMonth && revenueStats?.lastMonth 
        ? `${revenueStats.thisMonth > revenueStats.lastMonth ? '+' : ''}${Math.round(((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth) * 100)}% this month`
        : "No data",
      isPositive: revenueStats?.thisMonth > revenueStats?.lastMonth,
      icon: DollarSign,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      testId: "stat-revenue"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title} className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p 
                    className="text-3xl font-bold text-gray-900 mt-1"
                    data-testid={`${stat.testId}-value`}
                  >
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-2 flex items-center ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    <span data-testid={`${stat.testId}-growth`}>{stat.growth}</span>
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className={`text-xl ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
