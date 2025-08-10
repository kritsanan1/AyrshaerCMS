import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  language: z.string().default("en"),
  featuredImage: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: any;
  onSuccess?: () => void;
}

export default function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || "",
      content: article?.content || "",
      excerpt: article?.excerpt || "",
      status: article?.status || "draft",
      language: article?.language || "en",
      featuredImage: article?.featuredImage || "",
      tags: article?.tags?.join(", ") || "",
      metaTitle: article?.metaTitle || "",
      metaDescription: article?.metaDescription || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      };
      
      if (article) {
        await apiRequest("PUT", `/api/articles/${article.id}`, payload);
      } else {
        await apiRequest("POST", "/api/articles", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Article ${article ? "updated" : "created"} successfully`,
      });
      onSuccess?.();
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
        description: `Failed to ${article ? "update" : "create"} article`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter article title"
              data-testid="input-article-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...form.register("excerpt")}
              placeholder="Brief description of the article"
              rows={3}
              data-testid="input-article-excerpt"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              placeholder="Write your article content here..."
              rows={12}
              className="min-h-[300px]"
              data-testid="input-article-content"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...form.register("tags")}
              placeholder="Enter tags separated by commas"
              data-testid="input-article-tags"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as any)}
            >
              <SelectTrigger data-testid="select-article-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(value) => form.setValue("language", value)}
            >
              <SelectTrigger data-testid="select-article-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <Input
              id="featuredImage"
              {...form.register("featuredImage")}
              placeholder="https://example.com/image.jpg"
              data-testid="input-article-featured-image"
            />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              {...form.register("metaTitle")}
              placeholder="SEO title for search engines"
              data-testid="input-article-meta-title"
            />
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              {...form.register("metaDescription")}
              placeholder="SEO description for search engines"
              rows={3}
              data-testid="input-article-meta-description"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          data-testid="button-submit-article"
        >
          {createMutation.isPending ? "Saving..." : article ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
