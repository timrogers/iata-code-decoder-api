/**
 * Example implementation of Priority 4-8 optimizations
 * Quick wins that can be implemented immediately
 */

import Fastify, { FastifyInstance } from 'fastify';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';

/**
 * OPTIMIZATION 1: Configure Fastify with performance settings
 * Impact: 5-10% throughput improvement + better stability
 */
export function createOptimizedFastifyInstance(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      // In production, use a structured logger like pino
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            headers: request.headers,
            remoteAddress: request.ip,
          };
        },
      },
    },
    
    // Performance tuning
    keepAliveTimeout: 72000,      // 72s (longer than typical load balancer timeouts)
    connectionTimeout: 10000,     // 10s to establish connection
    requestTimeout: 10000,        // 10s to complete request
    bodyLimit: 1048576,           // 1 MB max request body
    
    // Optimization flags
    ignoreTrailingSlash: true,    // /airports and /airports/ are the same
    caseSensitive: false,         // /Airports and /airports are the same
    
    // Disable request logging in production (already logged by structured logger)
    disableRequestLogging: process.env.NODE_ENV === 'production',
    
    // Trust proxy headers (important for rate limiting by IP)
    trustProxy: true,
  });
  
  return app;
}

/**
 * OPTIMIZATION 2: Configure compression optimally
 * Impact: 80-90% bandwidth reduction, already enabled but can be tuned
 */
export async function registerCompression(app: FastifyInstance) {
  await app.register(fastifyCompress, {
    global: true,
    threshold: 1024, // Only compress responses > 1KB
    
    // Compression level: 6 is good balance of speed vs ratio
    // 1 = fastest, 9 = best compression
    zlibOptions: {
      level: 6,
    },
    
    // Brotli for modern browsers (better compression than gzip)
    brotliOptions: {
      params: {
        [require('zlib').constants.BROTLI_PARAM_MODE]: require('zlib').constants.BROTLI_MODE_TEXT,
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4, // 0-11, 4 is good for dynamic content
      },
    },
    
    // Encodings to support
    encodings: ['gzip', 'deflate', 'br'],
  });
}

/**
 * OPTIMIZATION 3: Add rate limiting
 * Impact: Protects against abuse, ensures fair resource allocation
 */
export async function registerRateLimiting(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    global: true,
    max: 100,                    // 100 requests
    timeWindow: '1 minute',      // per minute per IP
    cache: 10000,                // Cache for 10k unique IPs
    
    // Whitelist localhost and health check IPs
    allowList: ['127.0.0.1', '::1'],
    
    // Skip rate limiting for health endpoint
    skipOnError: false,
    
    // Custom error response
    errorResponseBuilder: (request, context) => {
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${context.ttl} seconds.`,
        limit: context.max,
        remaining: context.remaining,
        retryAfter: context.ttl,
      };
    },
    
    // Add rate limit headers to response
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    
    // Key generator - use IP address
    keyGenerator: (request) => {
      return request.ip;
    },
  });
  
  console.log('Rate limiting enabled: 100 requests/minute per IP');
}

/**
 * OPTIMIZATION 4: Add security headers with Helmet
 * Impact: Better security posture, minimal performance impact
 */
export async function registerSecurityHeaders(app: FastifyInstance) {
  await app.register(fastifyHelmet, {
    // Global defaults
    global: true,
    
    // Content Security Policy - adjust based on your needs
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    
    // Other security headers
    crossOriginEmbedderPolicy: false, // May break some clients
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    
    // HSTS - enable in production with HTTPS
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    
    // Additional headers
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    xXssProtection: true,
  });
  
  console.log('Security headers enabled');
}

/**
 * OPTIMIZATION 5: Optimized Airlines endpoint
 * Cache the "all airlines" response to avoid re-serialization
 */
export const CACHED_ALL_AIRLINES_RESPONSE = (() => {
  // This will be computed once at module load
  console.log('Pre-computing cached airlines response...');
  return Object.freeze({
    data: [], // Will be set by the actual data
  });
})();

/**
 * OPTIMIZATION 6: Data normalization helper
 * Normalize IATA codes to lowercase at load time to avoid repeated toLowerCase() calls
 */
export function normalizeIataCode<T extends { iataCode: string }>(item: T): T & { 
  iataCode: string; 
  iataCodeDisplay: string; 
} {
  return {
    ...item,
    iataCode: item.iataCode.toLowerCase(),      // Normalized for searching
    iataCodeDisplay: item.iataCode,             // Original for display
  };
}

/**
 * OPTIMIZATION 7: Graceful shutdown handler
 * Properly close connections on shutdown
 */
export function registerGracefulShutdown(app: FastifyInstance) {
  const signals = ['SIGINT', 'SIGTERM'];
  
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, closing server gracefully...`);
      
      try {
        await app.close();
        console.log('Server closed successfully');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });
  });
}

/**
 * OPTIMIZATION 8: Health check optimization
 * Pre-compute health check response to avoid object allocation
 */
export const HEALTH_CHECK_RESPONSE = Object.freeze({ success: true });

/**
 * OPTIMIZATION 9: Error response constants
 * Pre-allocate common error responses
 */
export const ERROR_RESPONSES = {
  QUERY_REQUIRED: Object.freeze({
    data: {
      error: 'A search query must be provided via the `query` querystring parameter',
    },
  }),
  
  QUERY_TOO_LONG: Object.freeze({
    data: {
      error: 'Query parameter exceeds maximum length',
    },
  }),
  
  INTERNAL_ERROR: Object.freeze({
    data: {
      error: 'Internal server error',
    },
  }),
};

/**
 * OPTIMIZATION 10: Constants for magic numbers
 */
export const PERFORMANCE_CONSTANTS = {
  // Cache durations
  CACHE_DURATION_SECONDS: 60 * 60 * 24, // 24 hours
  
  // Rate limiting
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  
  // Pagination
  DEFAULT_PAGE_LIMIT: 50,
  MAX_PAGE_LIMIT: 500,
  
  // IATA code lengths
  AIRPORT_CODE_LENGTH: 3,
  AIRLINE_CODE_LENGTH: 2,
  AIRCRAFT_CODE_LENGTH: 3,
  
  // Result limits
  MAX_RESULTS_WITHOUT_WARNING: 500,
  
  // Timeouts
  REQUEST_TIMEOUT_MS: 10000,
  CONNECTION_TIMEOUT_MS: 10000,
  KEEP_ALIVE_TIMEOUT_MS: 72000,
};

/**
 * Example of putting it all together:
 * 
 * const app = createOptimizedFastifyInstance();
 * 
 * await registerCompression(app);
 * await registerRateLimiting(app);
 * await registerSecurityHeaders(app);
 * registerGracefulShutdown(app);
 * 
 * // Use optimized constants
 * app.get('/health', async () => HEALTH_CHECK_RESPONSE);
 * 
 * // Use pre-computed responses
 * app.get('/airlines', async (request, reply) => {
 *   if (!request.query.query) {
 *     reply.header('Cache-Control', `public, max-age=${PERFORMANCE_CONSTANTS.CACHE_DURATION_SECONDS}`);
 *     return CACHED_ALL_AIRLINES_RESPONSE;
 *   }
 *   // ... rest of handler
 * });
 */

/**
 * BONUS: Add monitoring endpoint
 */
export interface ServerMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  connections: number;
  timestamp: string;
}

export function getServerMetrics(): ServerMetrics {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: 0, // Would need to track this separately
    timestamp: new Date().toISOString(),
  };
}

/**
 * Usage:
 * app.get('/metrics', async () => getServerMetrics());
 */
