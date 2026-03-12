export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp (seconds) when the window resets
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
    // Periodically remove expired entries to prevent unbounded memory growth.
    // .unref() ensures the interval doesn't prevent the process from exiting.
    const cleanupInterval = setInterval(() => this.pruneExpired(), windowMs);
    if (cleanupInterval.unref) cleanupInterval.unref();
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        limit: this.limit,
        remaining: this.limit - 1,
        resetAt: Math.floor((now + this.windowMs) / 1000),
      };
    }

    // All requests within the window are counted, including rejected ones,
    // so that clients cannot bypass the limit by sending bursts of requests.
    entry.count++;
    const resetAt = Math.floor((entry.windowStart + this.windowMs) / 1000);

    return {
      allowed: entry.count <= this.limit,
      limit: this.limit,
      remaining: Math.max(0, this.limit - entry.count),
      resetAt,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.windowStart >= this.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

export function parseTimeWindow(timeWindow: string): number {
  const match = timeWindow.match(/^(\d+)\s+(seconds?|minutes?|hours?)$/i);
  if (!match) {
    throw new Error(`Invalid time window format: "${timeWindow}"`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('second')) return value * 1000;
  if (unit.startsWith('minute')) return value * 60 * 1000;
  if (unit.startsWith('hour')) return value * 60 * 60 * 1000;
  throw new Error(`Unknown time unit: "${unit}"`);
}
