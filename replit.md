# Ayrshaer CMS

## Overview

Ayrshaer CMS is a comprehensive content management system designed as a cross-platform web application for creators and businesses. The platform enables users to manage articles, media files, and products with integrated payment processing, AI-powered content insights, multi-language support, and detailed analytics. Built as a freemium SaaS solution, it targets individual creators and businesses looking to streamline their content workflow with intelligent automation and monetization features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, accessible UI design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod for validation and type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with session-based authentication using PostgreSQL session store
- **File Handling**: Multer for multipart/form-data file uploads
- **API Design**: RESTful API endpoints with comprehensive error handling

### Database Schema
- **Users**: Core user management with Stripe integration fields (customer ID, subscription ID)
- **Articles**: Content management with multi-language support, SEO fields, and status tracking
- **Media**: File management with metadata, alt text, and user association
- **Products**: E-commerce catalog with inventory, pricing, and category management
- **Analytics**: Event tracking for user behavior and performance metrics
- **AI Insights**: Storage for AI-generated content suggestions and analysis
- **Languages**: Multi-language content management system
- **Payments**: Transaction history and revenue tracking
- **Sessions**: Secure session management for authentication

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect) for seamless development environment integration
- **Session Management**: Express-session with PostgreSQL store for persistent sessions
- **Security**: HTTP-only cookies, secure session configuration, and middleware-based route protection
- **User Management**: Automatic user creation on first login with profile management

### AI Integration
- **Provider**: Google Gemini AI (Generative AI)
- **Features**: 
  - Content summarization for articles
  - Sentiment analysis with confidence scoring
  - Content suggestions based on topics
  - AI-powered insights and recommendations
- **API Design**: Structured JSON responses with error handling and rate limiting considerations

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Auth**: Authentication service with OpenID Connect support
- **Google Gemini AI**: Generative AI service for content analysis and suggestions

### Payment Processing
- **Stripe**: Complete payment infrastructure including:
  - Customer management and subscription handling
  - Payment processing with webhooks
  - Revenue analytics and reporting
  - Client-side integration with React Stripe.js

### Development & Deployment
- **Replit Platform**: Development environment with integrated deployment
- **Vite Plugins**: Runtime error overlay and development cartographer for enhanced debugging
- **TypeScript**: Full-stack type safety with shared schema definitions

### UI & Component Libraries
- **Radix UI**: Accessible, unstyled component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent icon system throughout the application

### Additional Integrations
- **Multer**: File upload handling with size limits and type validation
- **Express Middleware**: Comprehensive logging, error handling, and security middleware
- **WebSocket Support**: Real-time capabilities through Neon's WebSocket constructor configuration