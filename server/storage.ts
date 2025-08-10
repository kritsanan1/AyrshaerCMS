import {
  users,
  articles,
  media,
  products,
  analytics,
  aiInsights,
  languages,
  payments,
  subscriptions,
  usageTracking,
  socialPosts,
  type User,
  type UpsertUser,
  type Article,
  type InsertArticle,
  type Media,
  type InsertMedia,
  type Product,
  type InsertProduct,
  type Analytics,
  type InsertAnalytics,
  type AiInsight,
  type InsertAiInsight,
  type Language,
  type InsertLanguage,
  type Payment,
  type InsertPayment,
  type SocialPost,
  type InsertSocialPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Article operations
  getArticles(userId: string, limit?: number): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getPublishedArticles(limit?: number): Promise<Article[]>;

  // Media operations
  getMedia(userId: string, limit?: number): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: string): Promise<void>;

  // Product operations
  getProducts(userId: string, limit?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Analytics operations
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  getDashboardStats(userId: string): Promise<{
    articlesCount: number;
    mediaCount: number;
    productsCount: number;
    totalRevenue: number;
  }>;

  // AI Insights operations
  getAiInsights(userId: string, limit?: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markInsightAsRead(id: string): Promise<void>;

  // Language operations
  getLanguages(): Promise<Language[]>;
  createLanguage(language: InsertLanguage): Promise<Language>;

  // Payment operations
  getPayments(userId: string, limit?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getRevenueStats(userId: string): Promise<{
    thisMonth: number;
    lastMonth: number;
    totalTransactions: number;
  }>;

  // Subscription operations
  updateUserPlan(userId: string, planId: string): Promise<void>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<void>;
  
  // Usage tracking operations
  getCurrentUsage(userId: string): Promise<{
    articles: number;
    media: number;
    products: number;
    aiRequests: number;
    socialPostsCount: number;
  }>;
  incrementUsage(userId: string, type: 'articlesCount' | 'mediaStorageUsed' | 'productsCount' | 'aiRequestsCount' | 'socialPostsCount'): Promise<void>;

  // Social media operations
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Article operations
  async getArticles(userId: string, limit = 50): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.authorId, userId))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article> {
    const [updatedArticle] = await db
      .update(articles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getPublishedArticles(limit = 10): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }

  // Media operations
  async getMedia(userId: string, limit = 50): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.uploadedBy, userId))
      .orderBy(desc(media.createdAt))
      .limit(limit);
  }

  async getMediaById(id: string): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem;
  }

  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [newMedia] = await db.insert(media).values(mediaData).returning();
    return newMedia;
  }

  async deleteMedia(id: string): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Product operations
  async getProducts(userId: string, limit = 50): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.createdBy, userId))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Analytics operations
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db.insert(analytics).values(analyticsData).returning();
    return newAnalytics;
  }

  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    let query = db.select().from(analytics).where(eq(analytics.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(analytics.createdAt, startDate),
          lte(analytics.createdAt, endDate)
        )
      );
    }
    
    return await query.orderBy(desc(analytics.createdAt));
  }

  async getDashboardStats(userId: string): Promise<{
    articlesCount: number;
    mediaCount: number;
    productsCount: number;
    totalRevenue: number;
  }> {
    const [articlesResult] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.authorId, userId));

    const [mediaResult] = await db
      .select({ count: count() })
      .from(media)
      .where(eq(media.uploadedBy, userId));

    const [productsResult] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.createdBy, userId));

    const [revenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, userId),
          eq(payments.status, "succeeded")
        )
      );

    return {
      articlesCount: articlesResult.count,
      mediaCount: mediaResult.count,
      productsCount: productsResult.count,
      totalRevenue: Number(revenueResult.total) || 0,
    };
  }

  // AI Insights operations
  async getAiInsights(userId: string, limit = 10): Promise<AiInsight[]> {
    return await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.userId, userId))
      .orderBy(desc(aiInsights.createdAt))
      .limit(limit);
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const [newInsight] = await db.insert(aiInsights).values(insight).returning();
    return newInsight;
  }

  async markInsightAsRead(id: string): Promise<void> {
    await db
      .update(aiInsights)
      .set({ isRead: true })
      .where(eq(aiInsights.id, id));
  }

  // Language operations
  async getLanguages(): Promise<Language[]> {
    return await db
      .select()
      .from(languages)
      .where(eq(languages.isActive, true))
      .orderBy(languages.name);
  }

  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [newLanguage] = await db.insert(languages).values(language).returning();
    return newLanguage;
  }

  // Payment operations
  async getPayments(userId: string, limit = 50): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getRevenueStats(userId: string): Promise<{
    thisMonth: number;
    lastMonth: number;
    totalTransactions: number;
  }> {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, userId),
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startOfThisMonth)
        )
      );

    const [lastMonthResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, userId),
          eq(payments.status, "succeeded"),
          gte(payments.createdAt, startOfLastMonth),
          lte(payments.createdAt, endOfLastMonth)
        )
      );

    const [transactionsResult] = await db
      .select({ count: count() })
      .from(payments)
      .where(
        and(
          eq(payments.userId, userId),
          eq(payments.status, "succeeded")
        )
      );

    return {
      thisMonth: Number(thisMonthResult.total) || 0,
      lastMonth: Number(lastMonthResult.total) || 0,
      totalTransactions: transactionsResult.count,
    };
  }

  // Subscription operations
  async updateUserPlan(userId: string, planId: string): Promise<void> {
    await db
      .update(users)
      .set({ plan: planId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Usage tracking operations
  async getCurrentUsage(userId: string): Promise<{
    articles: number;
    media: number;
    products: number;
    aiRequests: number;
    socialPostsCount: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.month, currentMonth)
        )
      );

    if (!usage) {
      // Create initial usage record
      await db.insert(usageTracking).values({
        userId,
        month: currentMonth,
        articlesCount: 0,
        mediaStorageUsed: 0,
        productsCount: 0,
        aiRequestsCount: 0,
        socialPostsCount: 0,
      });

      return {
        articles: 0,
        media: 0,
        products: 0,
        aiRequests: 0,
        socialPostsCount: 0,
      };
    }

    return {
      articles: usage.articlesCount,
      media: usage.mediaStorageUsed,
      products: usage.productsCount,
      aiRequests: usage.aiRequestsCount,
      socialPostsCount: usage.socialPostsCount,
    };
  }

  async incrementUsage(userId: string, type: 'articlesCount' | 'mediaStorageUsed' | 'productsCount' | 'aiRequestsCount' | 'socialPostsCount'): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Ensure usage record exists
    await this.getCurrentUsage(userId);
    
    await db
      .update(usageTracking)
      .set({
        [type]: sql`${usageTracking[type]} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.month, currentMonth)
        )
      );
  }

  // Social media operations
  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const [newPost] = await db.insert(socialPosts).values(post).returning();
    return newPost;
  }
}

export const storage = new DatabaseStorage();
