import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Search, Images, Trash2, Download, Eye } from "lucide-react";

export default function Media() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");

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

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/media"],
    enabled: !!isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setAltText("");
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
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Success",
        description: "File deleted successfully",
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
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const filteredMedia = media?.filter(item =>
    item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.altText?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("altText", altText);

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(id);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "audio":
        return "🎵";
      default:
        return "📄";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-media-title">Media Library</h2>
              <p className="text-gray-600 text-sm">Upload and manage your media files</p>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-upload-media">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Media File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      data-testid="input-upload-file"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altText">Alt Text / Description</Label>
                    <Input
                      id="altText"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe this file"
                      data-testid="input-alt-text"
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-upload"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-media"
              />
            </div>
          </div>

          {/* Media Grid */}
          {mediaLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-40 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow" data-testid={`card-media-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="aspect-square mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">
                          {getFileIcon(item.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm truncate" title={item.originalName}>
                        {item.originalName}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {item.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {item.size ? formatFileSize(item.size) : "N/A"}
                        </span>
                      </div>
                      
                      {item.altText && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.altText}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.url, "_blank")}
                            data-testid={`button-view-${item.id}`}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = item.url;
                              link.download = item.originalName;
                              link.click();
                            }}
                            data-testid={`button-download-${item.id}`}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Upload your first media file to get started"}
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)} data-testid="button-upload-first">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
