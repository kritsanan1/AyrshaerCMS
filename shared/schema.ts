import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  plan: varchar("plan").default("free"), // free, premium, pro
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const articleStatusEnum = pgEnum('article_status', ['draft', 'published', 'archived']);

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  excerpt: text("excerpt"),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  status: articleStatusEnum("status").default("draft"),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  language: varchar("language", { length: 5 }).default("en"),
  featuredImage: varchar("featured_image"),
  tags: text("tags").array(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'audio', 'document']);

export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: mediaTypeEnum("type").notNull(),
  size: integer("size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  altText: text("alt_text"),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'out_of_stock']);

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  status: productStatusEnum("status").default("active"),
  inventory: integer("inventory").default(0),
  images: text("images").array(),
  category: varchar("category", { length: 100 }),
  tags: text("tags").array(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  event: varchar("event", { length: 100 }).notNull(), // page_view, article_read, product_view, etc.
  resourceId: varchar("resource_id"), // article id, product id, etc.
  resourceType: varchar("resource_type", { length: 50 }), // article, product, page
  metadata: jsonb("metadata"), // additional event data
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // suggestion, insight, tip
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
  isRead: boolean("is_read").default(false),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const languages = pgTable("languages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 5 }).unique().notNull(), // en, es, fr, etc.
  name: varchar("name", { length: 100 }).notNull(),
  nativeName: varchar("native_name", { length: 100 }),
  flag: varchar("flag", { length: 10 }), // emoji flag
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd"),
  status: varchar("status", { length: 50 }).notNull(), // succeeded, failed, pending, etc.
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  media: many(media),
  products: many(products),
  analytics: many(analytics),
  aiInsights: many(aiInsights),
  payments: many(payments),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [media.uploadedBy],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  user: one(users, {
    fields: [aiInsights.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
  createdAt: true,
});
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
