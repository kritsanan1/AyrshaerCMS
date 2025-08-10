import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ArticleForm from "@/components/forms/article-form";
import { Plus, Search, FileText, Edit, Trash2, Eye } from "lucide-react";

export default function Articles() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

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

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles"],
    enabled: !!isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  const filteredArticles = articles?.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteMutation.mutate(id);
    }
  };

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
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-articles-title">Articles</h2>
              <p className="text-gray-600 text-sm">Create and manage your articles</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-article">
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Article</DialogTitle>
                </DialogHeader>
                <ArticleForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-articles"
              />
            </div>
          </div>

          {/* Articles Grid */}
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow" data-testid={`card-article-${article.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(article.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(article.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingArticle(article)}
                          data-testid={`button-edit-${article.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${article.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {article.status === "published" && (
                        <Button variant="ghost" size="sm" data-testid={`button-view-${article.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first article"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-article">
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        {editingArticle && (
          <Dialog open={!!editingArticle} onOpenChange={() => setEditingArticle(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Article</DialogTitle>
              </DialogHeader>
              <ArticleForm
                article={editingArticle}
                onSuccess={() => {
                  setEditingArticle(null);
                  queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
