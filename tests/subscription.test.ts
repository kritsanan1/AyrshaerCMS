// Subscription and pricing tests
import { describe, it, expect, beforeEach } from '@jest/globals';
import { SUBSCRIPTION_PLANS, getPlanById, canUserPerformAction } from '@shared/subscription-plans';
import { createTestSubscription, createTestUsageTracking, testUser } from './setup';

describe('Subscription Plans', () => {
  it('should have correct plan structure', () => {
    expect(SUBSCRIPTION_PLANS).toHaveLength(3);
    expect(SUBSCRIPTION_PLANS.map(p => p.id)).toEqual(['free', 'premium', 'pro']);
  });

  it('should get plan by ID correctly', () => {
    const freePlan = getPlanById('free');
    expect(freePlan).toBeDefined();
    expect(freePlan?.name).toBe('Free');
    expect(freePlan?.price).toBe(0);

    const invalidPlan = getPlanById('invalid');
    expect(invalidPlan).toBeUndefined();
  });

  it('should validate plan limits correctly', () => {
    // Free plan limits
    const freeUsage = { articles: 3, media: 50, products: 2, aiRequests: 8 };
    
    expect(canUserPerformAction('free', 'create_article', freeUsage)).toBe(true);
    expect(canUserPerformAction('free', 'create_article', { ...freeUsage, articles: 5 })).toBe(false);
    expect(canUserPerformAction('free', 'ai_request', freeUsage)).toBe(true);
    expect(canUserPerformAction('free', 'ai_request', { ...freeUsage, aiRequests: 10 })).toBe(false);

    // Premium plan (unlimited articles)
    const premiumUsage = { articles: 100, media: 5000, products: 50, aiRequests: 400 };
    
    expect(canUserPerformAction('premium', 'create_article', premiumUsage)).toBe(true);
    expect(canUserPerformAction('premium', 'ai_request', premiumUsage)).toBe(true);
    expect(canUserPerformAction('premium', 'ai_request', { ...premiumUsage, aiRequests: 500 })).toBe(false);
  });
});

describe('Subscription Management', () => {
  beforeEach(async () => {
    // Test setup is handled by global hooks
  });

  it('should create subscription correctly', async () => {
    const subscription = await createTestSubscription(testUser.id, 'premium');
    
    expect(subscription).toBeDefined();
    expect(subscription.userId).toBe(testUser.id);
    expect(subscription.planId).toBe('premium');
    expect(subscription.status).toBe('active');
  });

  it('should track usage correctly', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await createTestUsageTracking(testUser.id, currentMonth);
    
    expect(usage).toBeDefined();
    expect(usage.userId).toBe(testUser.id);
    expect(usage.month).toBe(currentMonth);
    expect(usage.articlesCount).toBe(2);
    expect(usage.aiRequestsCount).toBe(5);
  });
});

describe('Plan Features', () => {
  it('should have correct free plan features', () => {
    const freePlan = getPlanById('free');
    expect(freePlan?.features).toContain('5 articles per month');
    expect(freePlan?.features).toContain('10 AI requests per month');
    expect(freePlan?.limits.articles).toBe(5);
    expect(freePlan?.limits.aiRequests).toBe(10);
  });

  it('should have correct premium plan features', () => {
    const premiumPlan = getPlanById('premium');
    expect(premiumPlan?.features).toContain('Unlimited articles');
    expect(premiumPlan?.features).toContain('500 AI requests per month');
    expect(premiumPlan?.limits.articles).toBe(-1); // unlimited
    expect(premiumPlan?.limits.aiRequests).toBe(500);
  });

  it('should have correct pro plan features', () => {
    const proPlan = getPlanById('pro');
    expect(proPlan?.features).toContain('Everything in Premium');
    expect(proPlan?.features).toContain('2000 AI requests per month');
    expect(proPlan?.limits.articles).toBe(-1); // unlimited
    expect(proPlan?.limits.aiRequests).toBe(2000);
  });
});