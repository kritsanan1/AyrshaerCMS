import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Lightbulb, FileText, TrendingUp, Sparkles, Zap } from "lucide-react";

export default function AITools() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [contentTopic, setContentTopic] = useState("");
  const [sentimentText, setSentimentText] = useState("");
  const [summarizeText, setSummarizeText] = useState("");

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

  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights"],
    enabled: !!isAuthenticated,
  });

  const contentSuggestionsMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest("POST", "/api/ai/content-suggestions", { topic });
      return response.json();
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
        description: "Failed to generate content suggestions",
        variant: "destructive",
      });
    },
  });

  const sentimentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-sentiment", { text });
      return response.json();
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
        description: "Failed to analyze sentiment",
        variant: "destructive",
      });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/summarize", { text });
      return response.json();
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
        description: "Failed to summarize text",
        variant: "destructive",
      });
    },
  });

  const handleContentSuggestions = () => {
    if (!contentTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }
    contentSuggestionsMutation.mutate(contentTopic);
  };

  const handleSentimentAnalysis = () => {
    if (!sentimentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }
    sentimentMutation.mutate(sentimentText);
  };

  const handleSummarize = () => {
    if (!summarizeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to summarize",
        variant: "destructive",
      });
      return;
    }
    summarizeMutation.mutate(summarizeText);
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
              <h2 className="text-2xl font-bold text-gray-900 flex items-center" data-testid="text-ai-tools-title">
                <Brain className="w-8 h-8 mr-3 text-primary" />
                AI Tools
              </h2>
              <p className="text-gray-600 text-sm">Leverage AI to enhance your content creation and analysis</p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights && insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-4 bg-white rounded-lg border border-primary/10">
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{insight.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No AI insights available</p>
                  <p className="text-sm text-gray-400">Create more content to get personalized insights</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Tools */}
          <Tabs defaultValue="content-suggestions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content-suggestions">Content Suggestions</TabsTrigger>
              <TabsTrigger value="sentiment-analysis">Sentiment Analysis</TabsTrigger>
              <TabsTrigger value="text-summarizer">Text Summarizer</TabsTrigger>
            </TabsList>

            <TabsContent value="content-suggestions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                    Content Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content-topic">Topic</Label>
                    <Input
                      id="content-topic"
                      value={contentTopic}
                      onChange={(e) => setContentTopic(e.target.value)}
                      placeholder="e.g., React, Machine Learning, Web Development"
                      data-testid="input-content-topic"
                    />
                  </div>
                  <Button
                    onClick={handleContentSuggestions}
                    disabled={contentSuggestionsMutation.isPending}
                    className="w-full"
                    data-testid="button-generate-suggestions"
                  >
                    {contentSuggestionsMutation.isPending ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Generating Suggestions...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Generate Content Ideas
                      </>
                    )}
                  </Button>
                  
                  {contentSuggestionsMutation.data && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Generated Suggestions:</h4>
                      <ul className="space-y-2">
                        {contentSuggestionsMutation.data.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-primary">•</span>
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment-analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sentiment-text">Text to Analyze</Label>
                    <Textarea
                      id="sentiment-text"
                      value={sentimentText}
                      onChange={(e) => setSentimentText(e.target.value)}
                      placeholder="Enter text to analyze sentiment..."
                      rows={4}
                      data-testid="input-sentiment-text"
                    />
                  </div>
                  <Button
                    onClick={handleSentimentAnalysis}
                    disabled={sentimentMutation.isPending}
                    className="w-full"
                    data-testid="button-analyze-sentiment"
                  >
                    {sentimentMutation.isPending ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Analyze Sentiment
                      </>
                    )}
                  </Button>
                  
                  {sentimentMutation.data && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Sentiment Analysis Results:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Rating:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < sentimentMutation.data.rating ? "text-yellow-400" : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              ({sentimentMutation.data.rating}/5)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">
                            {Math.round(sentimentMutation.data.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text-summarizer">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Text Summarizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="summarize-text">Text to Summarize</Label>
                    <Textarea
                      id="summarize-text"
                      value={summarizeText}
                      onChange={(e) => setSummarizeText(e.target.value)}
                      placeholder="Enter long text to create a summary..."
                      rows={6}
                      data-testid="input-summarize-text"
                    />
                  </div>
                  <Button
                    onClick={handleSummarize}
                    disabled={summarizeMutation.isPending}
                    className="w-full"
                    data-testid="button-summarize-text"
                  >
                    {summarizeMutation.isPending ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  
                  {summarizeMutation.data && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Summary:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {summarizeMutation.data.summary}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
