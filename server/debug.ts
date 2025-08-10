// Enhanced debugging and logging utilities for Ayrshaer CMS
import fs from 'fs';
import path from 'path';

export interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  metadata?: any;
  userId?: string;
  requestId?: string;
}

class DebugLogger {
  private logFile: string;
  private isProduction: boolean;

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'debug.log');
    this.isProduction = process.env.NODE_ENV === 'production';
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private formatLog(log: DebugLog): string {
    return JSON.stringify({
      ...log,
      timestamp: new Date().toISOString(),
    }) + '\n';
  }

  private writeToFile(log: DebugLog) {
    if (!this.isProduction) {
      try {
        fs.appendFileSync(this.logFile, this.formatLog(log));
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  info(category: string, message: string, metadata?: any, userId?: string, requestId?: string) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level: 'info',
      category,
      message,
      metadata,
      userId,
      requestId,
    };

    console.log(`[INFO] ${category}: ${message}`, metadata ? metadata : '');
    this.writeToFile(log);
  }

  warn(category: string, message: string, metadata?: any, userId?: string, requestId?: string) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      category,
      message,
      metadata,
      userId,
      requestId,
    };

    console.warn(`[WARN] ${category}: ${message}`, metadata ? metadata : '');
    this.writeToFile(log);
  }

  error(category: string, message: string, error?: Error, metadata?: any, userId?: string, requestId?: string) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      metadata: {
        ...metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
      userId,
      requestId,
    };

    console.error(`[ERROR] ${category}: ${message}`, error || metadata || '');
    this.writeToFile(log);
  }

  debug(category: string, message: string, metadata?: any, userId?: string, requestId?: string) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      const log: DebugLog = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        category,
        message,
        metadata,
        userId,
        requestId,
      };

      console.debug(`[DEBUG] ${category}: ${message}`, metadata ? metadata : '');
      this.writeToFile(log);
    }
  }

  // Performance monitoring
  startTimer(label: string): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug('performance', `${label} completed`, { duration: `${duration}ms` });
      return duration;
    };
  }

  // API request logging
  logApiRequest(method: string, path: string, userId?: string, requestId?: string) {
    this.info('api', `${method} ${path}`, { method, path }, userId, requestId);
  }

  logApiResponse(method: string, path: string, status: number, duration: number, userId?: string, requestId?: string) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this[level]('api', `${method} ${path} - ${status}`, { 
      method, 
      path, 
      status, 
      duration: `${duration}ms` 
    }, userId, requestId);
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, duration: number, userId?: string) {
    this.debug('database', `${operation} on ${table}`, { 
      operation, 
      table, 
      duration: `${duration}ms` 
    }, userId);
  }

  // AI operation logging
  logAiOperation(operation: string, model: string, tokensUsed?: number, userId?: string) {
    this.info('ai', `${operation} with ${model}`, { 
      operation, 
      model, 
      tokensUsed 
    }, userId);
  }

  // Subscription operation logging
  logSubscriptionEvent(event: string, planId: string, userId: string, metadata?: any) {
    this.info('subscription', `${event} for plan ${planId}`, { 
      event, 
      planId, 
      ...metadata 
    }, userId);
  }

  // Social media operation logging
  logSocialMediaOperation(operation: string, platforms: string[], userId: string, postId?: string) {
    this.info('social', `${operation} to ${platforms.join(', ')}`, { 
      operation, 
      platforms, 
      postId 
    }, userId);
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 100): DebugLog[] {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const data = fs.readFileSync(this.logFile, 'utf8');
      const lines = data.trim().split('\n').filter(line => line.length > 0);
      
      return lines
        .slice(-count)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log !== null);
    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  // Clear old logs (keep last 1000 entries)
  rotateLogs() {
    try {
      const logs = this.getRecentLogs(1000);
      const newContent = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
      fs.writeFileSync(this.logFile, newContent);
      this.info('system', 'Log rotation completed', { keptEntries: logs.length });
    } catch (error) {
      this.error('system', 'Log rotation failed', error as Error);
    }
  }
}

// Create singleton instance
export const logger = new DebugLogger();

// Express middleware for request logging
export function requestLogger(req: any, res: any, next: any) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  req.requestId = requestId;
  req.startTime = startTime;

  const userId = req.user?.claims?.sub;
  
  logger.logApiRequest(req.method, req.path, userId, requestId);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const duration = Date.now() - startTime;
    logger.logApiResponse(req.method, req.path, res.statusCode, duration, userId, requestId);
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Error handler middleware
export function errorLogger(err: Error, req: any, res: any, next: any) {
  const userId = req.user?.claims?.sub;
  const requestId = req.requestId;
  
  logger.error('api', `Unhandled error in ${req.method} ${req.path}`, err, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  }, userId, requestId);

  next(err);
}

// Health check utilities
export function checkSystemHealth() {
  const health = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      database: 'connected', // This would be a real check in production
      ai: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
    },
  };

  logger.info('health', 'System health check', health);
  return health;
}