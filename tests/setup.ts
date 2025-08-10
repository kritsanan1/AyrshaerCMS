// Test setup and utilities for Ayrshaer CMS
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { db } from '../server/db';
import { users, articles, products, media, subscriptions, usageTracking } from '@shared/schema';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.VITE_STRIPE_PUBLIC_KEY = 'pk_test_123';

// Test user data
export const testUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  plan: 'free',
};

export const testArticle = {
  title: 'Test Article',
  content: 'This is a test article content.',
  slug: 'test-article',
  authorId: testUser.id,
  status: 'published' as const,
};

export const testProduct = {
  name: 'Test Product',
  description: 'This is a test product.',
  price: '29.99',
  sku: 'TEST-001',
  createdBy: testUser.id,
};

// Database setup and cleanup utilities
export async function setupTestDatabase() {
  // Clean up existing test data
  await cleanupTestDatabase();
  
  // Insert test user
  await db.insert(users).values(testUser);
}

export async function cleanupTestDatabase() {
  try {
    // Delete in order to respect foreign key constraints
    await db.delete(usageTracking);
    await db.delete(subscriptions);
    await db.delete(articles);
    await db.delete(products);
    await db.delete(media);
    await db.delete(users);
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
}

// Mock API response utilities
export function mockSuccessResponse(data: any) {
  return {
    json: () => Promise.resolve(data),
    ok: true,
    status: 200,
    statusText: 'OK',
  } as Response;
}

export function mockErrorResponse(status: number, message: string) {
  return {
    json: () => Promise.resolve({ error: message }),
    ok: false,
    status,
    statusText: message,
  } as Response;
}

// Test helpers for subscription testing
export async function createTestSubscription(userId: string, planId: string) {
  const subscription = {
    userId,
    planId,
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };
  
  const [created] = await db.insert(subscriptions).values(subscription).returning();
  return created;
}

export async function createTestUsageTracking(userId: string, month: string) {
  const usage = {
    userId,
    month,
    articlesCount: 2,
    mediaStorageUsed: 50, // MB
    productsCount: 1,
    aiRequestsCount: 5,
    socialPostsCount: 3,
  };
  
  const [created] = await db.insert(usageTracking).values(usage).returning();
  return created;
}

// Global test hooks
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

beforeEach(async () => {
  // Reset to clean state before each test
  await setupTestDatabase();
});

afterEach(async () => {
  // Optional: cleanup after each test if needed
  // await cleanupTestDatabase();
});