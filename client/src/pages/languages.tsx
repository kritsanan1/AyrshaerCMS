import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Plus, Check, X } from "lucide-react";

const popularLanguages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];

export default function Languages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

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

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ["/api/languages"],
    enabled: !!isAuthenticated,
  });

  const addLanguageMutation = useMutation({
    mutationFn: async (language: any) => {
      await apiRequest("POST", "/api/languages", language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/languages"] });
      toast({
        title: "Success",
        description: "Language added successfully",
      });
      setIsAddDialogOpen(false);
      setSelectedLanguage(null);
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
        description: "Failed to add language",
        variant: "destructive",
      });
    },
  });

  const handleAddLanguage = (language) => {
    addLanguageMutation.mutate({
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flag: language.flag,
      isActive: true,
    });
  };

  const availableLanguages = popularLanguages.filter(
    (lang) => !languages?.some((existing) => existing.code === lang.code)
  );

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
              <h2 className="text-2xl font-bold text-gray-900 flex items-center" data-testid="text-languages-title">
                <Globe className="w-8 h-8 mr-3 text-primary" />
                Languages
              </h2>
              <p className="text-gray-600 text-sm">Manage multi-language content support</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-language">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Language
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Language</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select a Language</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-64 overflow-y-auto">
                      {availableLanguages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => setSelectedLanguage(language)}
                          className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedLanguage?.code === language.code ? "border-primary bg-primary/5" : ""
                          }`}
                          data-testid={`button-select-${language.code}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{language.flag}</span>
                            <div className="text-left">
                              <p className="font-medium">{language.name}</p>
                              <p className="text-sm text-gray-500">{language.nativeName}</p>
                            </div>
                          </div>
                          {selectedLanguage?.code === language.code && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {selectedLanguage && (
                    <Button
                      onClick={() => handleAddLanguage(selectedLanguage)}
                      disabled={addLanguageMutation.isPending}
                      className="w-full"
                      data-testid="button-confirm-add-language"
                    >
                      {addLanguageMutation.isPending ? "Adding..." : `Add ${selectedLanguage.name}`}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Current Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Active Languages</CardTitle>
            </CardHeader>
            <CardContent>
              {languagesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : languages && languages.length > 0 ? (
                <div className="space-y-4">
                  {languages.map((language) => (
                    <div 
                      key={language.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid={`language-${language.code}`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <p className="font-medium">{language.name}</p>
                          <p className="text-sm text-gray-500">{language.nativeName}</p>
                        </div>
                        {language.code === "en" && (
                          <Badge className="bg-primary/10 text-primary">Primary</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={language.isActive ? "default" : "secondary"}>
                          {language.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-500">0 articles</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No languages configured</h3>
                  <p className="text-gray-500 mb-6">Add languages to support multi-language content</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-language">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Language Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Translation Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-Translation</p>
                    <p className="text-sm text-gray-500">AI-powered content translation</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Manual Translation</p>
                    <p className="text-sm text-gray-500">Create manual translations</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Language Detection</p>
                    <p className="text-sm text-gray-500">Auto-detect content language</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Date Format</p>
                    <p className="text-sm text-gray-500">Localized date formatting</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Currency Format</p>
                    <p className="text-sm text-gray-500">Regional currency display</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">RTL Support</p>
                    <p className="text-sm text-gray-500">Right-to-left text direction</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
