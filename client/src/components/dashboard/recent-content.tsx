import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, DollarSign, FileText } from "lucide-react";

export default function RecentContent() {
  const { data: articles } = useQuery({
    queryKey: ["/api/articles"],
    select: (data) => data?.slice(0, 3) || []
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    select: (data) => data?.slice(0, 2) || []
  });

  // Combine articles and products for recent content
  const recentContent = [
    ...(articles || []).map(article => ({
      id: article.id,
      title: article.title,
      type: "Article",
      status: article.status,
      time: new Date(article.updatedAt).toLocaleString(),
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop",
      testId: `content-article-${article.id}`
    })),
    ...(products || []).map(product => ({
      id: product.id,
      title: product.name,
      type: "Product",
      status: product.status,
      price: `$${product.price}`,
      time: new Date(product.updatedAt).toLocaleString(),
      thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
      testId: `content-product-${product.id}`
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 3);

  const getStatusBadge = (status: string, type: string, price?: string) => {
    if (type === "Product" && price) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <DollarSign className="w-3 h-3 mr-1" />
          {price}
        </Badge>
      );
    }

    if (status === "published" || status === "active") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status === "published" ? "Published" : "Active"}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3 mr-1" />
        {status === "draft" ? "Draft" : "Inactive"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Content</CardTitle>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="articles">Articles</SelectItem>
            <SelectItem value="products">Products</SelectItem>
            <SelectItem value="media">Media</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentContent.map((content) => (
            <div 
              key={content.id}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              data-testid={content.testId}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img 
                  src={content.thumbnail} 
                  alt={`${content.title} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {content.title}
                </p>
                <p className="text-xs text-gray-500">
                  {content.type} • Updated {new Date(content.time).toRelativeTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(content.status, content.type, content.price)}
              </div>
            </div>
          ))}
          
          {recentContent.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No content yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first article or product to see it here
              </p>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          data-testid="button-view-all-content"
        >
          View All Content
        </Button>
      </CardContent>
    </Card>
  );
}
