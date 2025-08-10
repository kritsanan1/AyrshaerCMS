export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    articles: number;
    media: number;
    products: number;
    aiRequests: number;
  };
  stripePriceId?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 articles per month',
      '100MB media storage',
      '3 products',
      '10 AI requests per month',
      'Basic analytics'
    ],
    limits: {
      articles: 5,
      media: 100, // MB
      products: 3,
      aiRequests: 10
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited articles',
      '10GB media storage',
      'Unlimited products',
      '500 AI requests per month',
      'Advanced analytics',
      'Priority support',
      'Custom domains'
    ],
    limits: {
      articles: -1, // unlimited
      media: 10240, // 10GB in MB
      products: -1,
      aiRequests: 500
    },
    stripePriceId: 'price_premium_monthly' // Set in environment
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    interval: 'month',
    features: [
      'Everything in Premium',
      'Unlimited media storage',
      '2000 AI requests per month',
      'White-label solution',
      'API access',
      'Advanced integrations',
      'Dedicated support'
    ],
    limits: {
      articles: -1,
      media: -1,
      products: -1,
      aiRequests: 2000
    },
    stripePriceId: 'price_pro_monthly' // Set in environment
  }
];

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function canUserPerformAction(
  userPlan: string,
  action: 'create_article' | 'upload_media' | 'create_product' | 'ai_request',
  currentUsage: { articles: number; media: number; products: number; aiRequests: number }
): boolean {
  const plan = getPlanById(userPlan);
  if (!plan) return false;

  switch (action) {
    case 'create_article':
      return plan.limits.articles === -1 || currentUsage.articles < plan.limits.articles;
    case 'upload_media':
      return plan.limits.media === -1 || currentUsage.media < plan.limits.media;
    case 'create_product':
      return plan.limits.products === -1 || currentUsage.products < plan.limits.products;
    case 'ai_request':
      return plan.limits.aiRequests === -1 || currentUsage.aiRequests < plan.limits.aiRequests;
    default:
      return false;
  }
}