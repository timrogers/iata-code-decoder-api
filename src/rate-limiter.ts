import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private getClientKey(req: Request): string {
    // Use IP address as the key, could be enhanced with user identification
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  private isRateLimited(clientKey: string): { limited: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now();
    const entry = this.requests.get(clientKey);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.requests.set(clientKey, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        limited: false,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        limited: true,
        resetTime: entry.resetTime,
        remaining: 0,
      };
    }

    entry.count += 1;
    return {
      limited: false,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientKey = this.getClientKey(req);
      const { limited, resetTime, remaining } = this.isRateLimited(clientKey);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining?.toString() || '0',
        'X-RateLimit-Reset': resetTime ? Math.ceil(resetTime / 1000).toString() : '0',
      });

      if (limited) {
        res.status(429).json({
          data: {
            error: 'Too many requests. Please try again later.',
            retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60,
          },
        });
        return;
      }

      next();
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }

  getStats(): { totalClients: number; totalRequests: number } {
    let totalRequests = 0;
    for (const entry of this.requests.values()) {
      totalRequests += entry.count;
    }
    return {
      totalClients: this.requests.size,
      totalRequests,
    };
  }
}

// Create global rate limiter instance
export const rateLimiter = new RateLimiter(60000, 100); // 100 requests per minute

// Create stricter rate limiter for health check
export const healthRateLimiter = new RateLimiter(10000, 20); // 20 requests per 10 seconds