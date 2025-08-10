import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertArticleSchema, 
  insertProductSchema, 
  insertMediaSchema,
  insertAnalyticsSchema,
  insertLanguageSchema,
  insertSubscriptionSchema,
  insertSocialPostSchema
} from "@shared/schema";
import { generateContentSuggestions, analyzeSentiment, summarizeArticle } from "./gemini";
import { ayrshaerAPI } from "./ayrshaer-api";
import { logger, requestLogger, errorLogger } from "./debug";
import { SUBSCRIPTION_PLANS, getPlanById, canUserPerformAction } from "@shared/subscription-plans";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add debug middleware
  app.use(requestLogger);
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Article routes
  app.get('/api/articles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const articles = await storage.getArticles(userId, limit);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/articles/:id', isAuthenticated, async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post('/api/articles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const articleData = insertArticleSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      // Generate slug if not provided
      if (!articleData.slug) {
        articleData.slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(400).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/articles/:id', isAuthenticated, async (req, res) => {
    try {
      const articleData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(req.params.id, articleData);
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(400).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/articles/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Media routes
  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const media = await storage.getMedia(userId, limit);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post('/api/media/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const file = req.file;
      
      // In a real application, you would upload to a cloud storage service
      // For now, we'll simulate with a local path
      const filename = `${Date.now()}-${file.originalname}`;
      const url = `/uploads/${filename}`;

      const mediaData = insertMediaSchema.parse({
        filename,
        originalName: file.originalname,
        url,
        type: file.mimetype.startsWith('image/') ? 'image' : 
              file.mimetype.startsWith('video/') ? 'video' :
              file.mimetype.startsWith('audio/') ? 'audio' : 'document',
        size: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
        altText: req.body.altText || '',
      });

      const media = await storage.createMedia(mediaData);
      res.status(201).json(media);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(400).json({ message: "Failed to upload media" });
    }
  });

  app.delete('/api/media/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMedia(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const products = await storage.getProducts(userId, limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productData = insertProductSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const analytics = await storage.getUserAnalytics(userId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/analytics/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyticsData = insertAnalyticsSchema.parse({
        ...req.body,
        userId,
      });

      const analytics = await storage.createAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(400).json({ message: "Failed to track analytics" });
    }
  });

  // AI routes
  app.get('/api/ai/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const insights = await storage.getAiInsights(userId, limit);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  app.post('/api/ai/content-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { topic, type = 'article' } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const suggestions = await generateContentSuggestions(topic, type);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating content suggestions:", error);
      res.status(500).json({ message: "Failed to generate content suggestions" });
    }
  });

  app.post('/api/ai/analyze-sentiment', isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const sentiment = await analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  app.post('/api/ai/summarize', isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const summary = await summarizeArticle(text);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing text:", error);
      res.status(500).json({ message: "Failed to summarize text" });
    }
  });

  // Language routes
  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.post('/api/languages', isAuthenticated, async (req, res) => {
    try {
      const languageData = insertLanguageSchema.parse(req.body);
      const language = await storage.createLanguage(languageData);
      res.status(201).json(language);
    } catch (error) {
      console.error("Error creating language:", error);
      res.status(400).json({ message: "Failed to create language" });
    }
  });

  // Payment routes
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const payments = await storage.getPayments(userId, limit);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get('/api/payments/revenue-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getRevenueStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "Failed to fetch revenue stats" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount, description } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Enhanced subscription management
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      logger.logSubscriptionEvent('create_subscription_request', planId, userId);
      
      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const plan = getPlanById(planId);
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      // Free plan doesn't require Stripe
      if (planId === 'free') {
        await storage.updateUserPlan(userId, 'free');
        logger.logSubscriptionEvent('plan_changed', 'free', userId);
        return res.json({ success: true, message: "Switched to free plan" });
      }

      // Check if user already has this subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const currentPlan = subscription.items.data[0]?.price.lookup_key || subscription.metadata?.planId;
        
        if (currentPlan === planId) {
          return res.json({ message: "Already subscribed to this plan" });
        }
        
        // Update existing subscription
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          items: [{
            id: subscription.items.data[0].id,
            price: plan.stripePriceId,
          }],
          proration_behavior: 'create_prorations',
        });
        
        await storage.updateUserPlan(userId, planId);
        logger.logSubscriptionEvent('plan_changed', planId, userId);
        return res.json({ success: true, message: "Plan updated successfully" });
      }

      // Create new customer and subscription
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        metadata: { userId },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: plan.stripePriceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: { userId, planId },
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
      await storage.updateUserPlan(userId, planId);

      const invoice = subscription.latest_invoice as any;
      logger.logSubscriptionEvent('subscription_created', planId, userId, { subscriptionId: subscription.id });
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent?.client_secret,
      });
    } catch (error: any) {
      logger.error('subscription', 'Failed to create subscription', error, { planId: req.body.planId }, req.user?.claims?.sub);
      res.status(400).json({ error: { message: error.message } });
    }
  });

  // Cancel subscription
  app.post('/api/cancel-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      logger.logSubscriptionEvent('subscription_canceled', user.plan || 'unknown', userId);
      res.json({ success: true, message: "Subscription will be canceled at period end" });
    } catch (error: any) {
      logger.error('subscription', 'Failed to cancel subscription', error, {}, req.user?.claims?.sub);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Get subscription status
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let subscriptionData = {
        currentPlan: user.plan || 'free',
        status: 'active',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      };

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        subscriptionData = {
          currentPlan: user.plan || 'free',
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.current_period_end,
        };
      }

      res.json(subscriptionData);
    } catch (error: any) {
      logger.error('subscription', 'Failed to get subscription status', error, {}, req.user?.claims?.sub);
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Social media routes (Ayrshaer integration)
  app.get('/api/social/profiles', isAuthenticated, async (req: any, res) => {
    try {
      if (!ayrshaerAPI) {
        return res.status(503).json({ message: "Social media service not configured" });
      }

      const profiles = await ayrshaerAPI.getProfiles();
      logger.logSocialMediaOperation('get_profiles', [], req.user.claims.sub);
      res.json(profiles);
    } catch (error: any) {
      logger.error('social', 'Failed to get social profiles', error, {}, req.user?.claims?.sub);
      res.status(500).json({ message: "Failed to fetch social profiles" });
    }
  });

  app.post('/api/social/post', isAuthenticated, async (req: any, res) => {
    try {
      if (!ayrshaerAPI) {
        return res.status(503).json({ message: "Social media service not configured" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user can perform social media posts based on their plan
      const usage = await storage.getCurrentUsage(userId);
      if (!canUserPerformAction(user?.plan || 'free', 'ai_request', usage)) {
        return res.status(403).json({ message: "Social media posting limit reached. Please upgrade your plan." });
      }

      const { platforms, content, mediaUrls, scheduleDate } = req.body;
      
      const postData = {
        platforms,
        post: content,
        mediaUrls,
        scheduleDate,
      };

      let result;
      if (scheduleDate) {
        result = await ayrshaerAPI.schedulePost(postData);
        logger.logSocialMediaOperation('schedule_post', platforms, userId);
      } else {
        result = await ayrshaerAPI.createPost(postData);
        logger.logSocialMediaOperation('create_post', platforms, userId);
      }

      // Save to database
      await storage.createSocialPost({
        userId,
        ayrshaerPostId: result.id,
        platforms,
        content,
        mediaUrls,
        scheduledFor: scheduleDate ? new Date(scheduleDate) : null,
        publishedAt: scheduleDate ? null : new Date(),
        status: scheduleDate ? 'scheduled' : 'published',
      });

      // Update usage tracking
      await storage.incrementUsage(userId, 'socialPostsCount');

      res.json(result);
    } catch (error: any) {
      logger.error('social', 'Failed to create social post', error, req.body, req.user?.claims?.sub);
      res.status(500).json({ message: "Failed to create social media post" });
    }
  });

  // Usage tracking and limits
  app.get('/api/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getCurrentUsage(userId);
      const user = await storage.getUser(userId);
      const plan = getPlanById(user?.plan || 'free');
      
      res.json({
        current: usage,
        limits: plan?.limits,
        canPerform: {
          createArticle: canUserPerformAction(user?.plan || 'free', 'create_article', usage),
          uploadMedia: canUserPerformAction(user?.plan || 'free', 'upload_media', usage),
          createProduct: canUserPerformAction(user?.plan || 'free', 'create_product', usage),
          aiRequest: canUserPerformAction(user?.plan || 'free', 'ai_request', usage),
        },
      });
    } catch (error: any) {
      logger.error('usage', 'Failed to get usage data', error, {}, req.user?.claims?.sub);
      res.status(500).json({ message: "Failed to fetch usage data" });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        ai: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
        social: process.env.AYRSHAER_API_KEY ? 'configured' : 'missing',
      },
    };
    
    logger.info('health', 'Health check requested', health);
    res.json(health);
  });

  // Debug logs endpoint (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/logs', isAuthenticated, (req: any, res) => {
      try {
        const count = parseInt(req.query.count as string) || 100;
        const logs = logger.getRecentLogs(count);
        res.json(logs);
      } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch debug logs" });
      }
    });
  }

  // Error handling middleware
  app.use(errorLogger);

  const httpServer = createServer(app);
  return httpServer;
}
