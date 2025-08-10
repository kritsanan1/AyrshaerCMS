import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { SUBSCRIPTION_PLANS } from "@shared/subscription-plans";
import { Check, Crown, Zap, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/create-subscription", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        // Redirect to Stripe checkout
        window.location.href = `/checkout?client_secret=${data.clientSecret}`;
      } else {
        toast({
          title: "Success",
          description: "Subscription updated successfully!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }
    createSubscriptionMutation.mutate(planId);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="w-8 h-8" />;
      case 'premium':
        return <Crown className="w-8 h-8" />;
      case 'pro':
        return <Zap className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'premium':
        return 'from-primary to-secondary';
      case 'pro':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900" data-testid="title-pricing">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Scale your content management with our flexible pricing options. 
          Start free and upgrade as you grow.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
            data-testid="button-monthly"
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'year'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
            data-testid="button-yearly"
          >
            Yearly
            <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = user?.plan === plan.id;
          const price = billingInterval === 'year' ? plan.price * 12 * 0.8 : plan.price;
          const displayPrice = billingInterval === 'year' ? price / 12 : price;

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.id === 'premium' ? 'border-primary shadow-lg scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.id === 'premium' && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.id === 'premium' ? 'pt-8' : ''}`}>
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${getPlanColor(plan.id)} rounded-full flex items-center justify-center text-white`}>
                  {getPlanIcon(plan.id)}
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${displayPrice.toFixed(2)}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-gray-600">
                        /{billingInterval === 'year' ? 'mo' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {billingInterval === 'year' && plan.price > 0 && (
                    <p className="text-sm text-gray-600">
                      Billed annually (${(price).toFixed(2)}/year)
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  className={`w-full ${
                    plan.id === 'premium'
                      ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                      : ''
                  }`}
                  variant={isCurrentPlan ? 'outline' : plan.id === 'premium' ? 'default' : 'outline'}
                  disabled={isCurrentPlan || createSubscriptionMutation.isPending}
                  onClick={() => handleSubscribe(plan.id)}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {createSubscriptionMutation.isPending
                    ? 'Processing...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : plan.id === 'free'
                    ? 'Get Started'
                    : 'Upgrade Now'
                  }
                </Button>

                {plan.id === 'free' && (
                  <p className="text-xs text-gray-500 text-center">
                    No credit card required
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect immediately and we'll prorate the billing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers 
                through our secure Stripe payment processor.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our Free plan gives you access to core features forever. 
                You can try premium features risk-free with our 30-day money-back guarantee.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Absolutely! You can cancel your subscription at any time. 
                You'll continue to have access until the end of your billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
        <p className="text-lg mb-6 opacity-90">
          Looking for enterprise features, custom integrations, or volume pricing? 
          We'd love to help you build the perfect solution.
        </p>
        <Button
          variant="outline"
          className="bg-white text-gray-900 hover:bg-gray-100"
          data-testid="button-contact-sales"
        >
          Contact Sales
        </Button>
      </div>
    </div>
  );
}