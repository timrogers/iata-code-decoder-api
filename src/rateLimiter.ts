export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
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
        resetSeconds: Math.ceil(this.windowMs / 1000),
      };
    }

    entry.count++;
    const elapsed = now - entry.windowStart;
    const resetSeconds = Math.ceil((this.windowMs - elapsed) / 1000);

    return {
      allowed: entry.count <= this.limit,
      limit: this.limit,
      remaining: Math.max(0, this.limit - entry.count),
      resetSeconds,
    };
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
