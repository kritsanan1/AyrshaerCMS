import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function AIInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/ai/insights"],
    enabled: true,
  });

  // Mock insights for demo
  const mockInsights = [
    {
      id: 1,
      type: "suggestion",
      title: "Content Suggestion",
      content: "Your tech articles get 40% more engagement. Consider creating more content about React and TypeScript.",
      priority: "high",
      icon: Lightbulb,
      bgColor: "bg-gradient-to-r from-primary/5 to-secondary/5",
      borderColor: "border-primary/10",
      iconColor: "text-primary"
    },
    {
      id: 2,
      type: "insight",
      title: "Performance Insight",
      content: "Your Thursday posts perform 25% better than other days. Try scheduling more content then.",
      priority: "medium",
      icon: TrendingUp,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600"
    },
    {
      id: 3,
      type: "tip",
      title: "Optimization Tip",
      content: "Your media library is 80% full. Consider upgrading your plan or organizing files.",
      priority: "medium",
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600"
    }
  ];

  const displayInsights = insights || mockInsights;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Brain className="text-white w-4 h-4" />
          </div>
          <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.slice(0, 3).map((insight) => {
            const Icon = insight.icon;
            
            return (
              <div 
                key={insight.id}
                className={`p-4 rounded-lg border ${insight.bgColor} ${insight.borderColor}`}
                data-testid={`insight-${insight.type}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`mt-1 w-4 h-4 ${insight.iconColor}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{insight.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {displayInsights.length === 0 && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No AI insights available</p>
              <p className="text-sm text-gray-400 mt-1">
                Create more content to get personalized insights
              </p>
            </div>
          )}
          
          <Link href="/ai-tools">
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              data-testid="button-open-ai-tools"
            >
              Open AI Tools
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
