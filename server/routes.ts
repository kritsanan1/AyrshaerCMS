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
  insertLanguageSchema 
} from "@shared/schema";
import { generateContentSuggestions, analyzeSentiment, summarizeArticle } from "./gemini";
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

  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: (invoice.payment_intent as any)?.client_secret,
        });
        return;
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });

      // Note: STRIPE_PRICE_ID needs to be set by the user
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Placeholder
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
