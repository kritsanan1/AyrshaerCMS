import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ungroup, FileText, Images, Box, BarChart3, Brain, CreditCard, Globe } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Ungroup className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ayrshaer</h1>
                <p className="text-xs text-gray-500">Content Management</p>
              </div>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Powerful Content Management
            <span className="block text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create, manage, and monetize your content with AI-powered insights, 
            seamless payments, and multi-language support. Everything you need 
            to build your digital empire.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="text-lg px-8 py-3"
            data-testid="button-get-started"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools creators and 
              businesses need to manage content and grow their audience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-blue-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Article Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Create, edit, and publish articles with our intuitive editor. 
                  Support for drafts, scheduling, and SEO optimization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Images className="text-green-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Media Library</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Upload, organize, and manage your media files. 
                  Support for images, videos, and documents with smart tagging.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Box className="text-purple-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Product Catalog</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Sell digital products, courses, or services. 
                  Inventory management and pricing tools included.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="text-yellow-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Track performance with detailed analytics. 
                  Understand your audience and optimize your content strategy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-white text-xl" />
                </div>
                <CardTitle className="text-lg">AI-Powered Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Get content suggestions, sentiment analysis, and performance insights 
                  powered by advanced AI technology.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-emerald-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Payment Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Secure payment processing with Stripe. 
                  Accept payments for products and services seamlessly.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-indigo-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Multi-Language</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Reach global audiences with multi-language content support. 
                  Easy translation management and localization tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-crown text-white text-xl"></i>
                </div>
                <CardTitle className="text-lg">Premium Features</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Advanced analytics, unlimited storage, priority support, 
                  and exclusive AI features for growing businesses.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and businesses who trust Ayrshaer 
            to manage and grow their digital presence.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleLogin}
            className="text-lg px-8 py-3 bg-white text-primary hover:bg-gray-50"
            data-testid="button-start-free"
          >
            Start Free Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Ungroup className="text-white text-sm" />
            </div>
            <span className="text-lg font-semibold">Ayrshaer</span>
          </div>
          <p className="text-gray-400">
            © 2025 Ayrshaer. All rights reserved. Built with ❤️ for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}
