import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { getDataIndexes, getDataStats, isInitialized } from './data-loader.js';
import { searchIndex } from './search-index.js';
import { searchCache } from './cache.js';
import { validateIataCodeQuery, sanitizeResponseData, hasValidHeaders } from './validation.js';
import { rateLimiter, healthRateLimiter } from './rate-limiter.js';

const app = express();

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const MAX_RESULTS_PER_REQUEST = 100;

// Middleware
app.use(compression());
app.use(morgan('tiny'));

// Trust proxy for accurate IP addresses in rate limiting
app.set('trust proxy', 1);

// Apply rate limiting to all routes
app.use(rateLimiter.middleware());

/**
 * Optimized search function that uses indexes and caching
 */
function performOptimizedSearch(
  dataType: 'airports' | 'airlines' | 'aircraft',
  query: string,
  maxCodeLength: number,
): any[] {
  // Generate cache key
  const cacheKey = searchCache.generateKey(dataType, query);
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Perform search using indexes
  const indexes = getDataIndexes();
  const results = searchIndex(indexes[dataType], query, maxCodeLength);
  
  // Sanitize and limit results
  const sanitized = sanitizeResponseData(results, MAX_RESULTS_PER_REQUEST);

  // Cache the results
  searchCache.set(cacheKey, sanitized);

  return sanitized;
}

/**
 * Health check endpoint with separate rate limiting
 */
app.get('/health', healthRateLimiter.middleware(), async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  // Check if data is initialized
  if (!isInitialized()) {
    res.status(503).json({ 
      success: false, 
      error: 'Service initializing, please try again in a moment' 
    });
    return;
  }

  const stats = getDataStats();
  res.status(200).json({ 
    success: true,
    timestamp: new Date().toISOString(),
    dataStats: stats ? {
      airports: stats.airports.total,
      airlines: stats.airlines.total,
      aircraft: stats.aircraft.total,
    } : null,
    cacheSize: searchCache.size(),
  });
});

/**
 * Airports search endpoint
 */
app.get('/airports', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  // Basic header validation
  if (!hasValidHeaders(req)) {
    res.status(400).json({
      data: { error: 'Invalid request headers' }
    });
    return;
  }

  // Validate query
  const validation = validateIataCodeQuery(req.query.query, 3);
  if (!validation.isValid) {
    res.status(400).json({
      data: { error: validation.error }
    });
    return;
  }

  try {
    const results = performOptimizedSearch('airports', validation.sanitizedValue!, 3);
    res.json({ 
      data: results,
      meta: {
        count: results.length,
        query: validation.sanitizedValue,
        cached: searchCache.get(searchCache.generateKey('airports', validation.sanitizedValue!)) !== undefined
      }
    });
  } catch (error) {
    console.error('Error searching airports:', error);
    res.status(500).json({
      data: { error: 'Internal server error' }
    });
  }
});

/**
 * Airlines search endpoint
 */
app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  // Basic header validation
  if (!hasValidHeaders(req)) {
    res.status(400).json({
      data: { error: 'Invalid request headers' }
    });
    return;
  }

  // Validate query
  const validation = validateIataCodeQuery(req.query.query, 2);
  if (!validation.isValid) {
    res.status(400).json({
      data: { error: validation.error }
    });
    return;
  }

  try {
    const results = performOptimizedSearch('airlines', validation.sanitizedValue!, 2);
    res.json({ 
      data: results,
      meta: {
        count: results.length,
        query: validation.sanitizedValue,
        cached: searchCache.get(searchCache.generateKey('airlines', validation.sanitizedValue!)) !== undefined
      }
    });
  } catch (error) {
    console.error('Error searching airlines:', error);
    res.status(500).json({
      data: { error: 'Internal server error' }
    });
  }
});

/**
 * Aircraft search endpoint
 */
app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  // Basic header validation
  if (!hasValidHeaders(req)) {
    res.status(400).json({
      data: { error: 'Invalid request headers' }
    });
    return;
  }

  // Validate query
  const validation = validateIataCodeQuery(req.query.query, 3);
  if (!validation.isValid) {
    res.status(400).json({
      data: { error: validation.error }
    });
    return;
  }

  try {
    const results = performOptimizedSearch('aircraft', validation.sanitizedValue!, 3);
    res.json({ 
      data: results,
      meta: {
        count: results.length,
        query: validation.sanitizedValue,
        cached: searchCache.get(searchCache.generateKey('aircraft', validation.sanitizedValue!)) !== undefined
      }
    });
  } catch (error) {
    console.error('Error searching aircraft:', error);
    res.status(500).json({
      data: { error: 'Internal server error' }
    });
  }
});

/**
 * Performance stats endpoint (for monitoring)
 */
app.get('/stats', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const stats = getDataStats();
  const rateLimitStats = rateLimiter.getStats();

  res.json({
    data: {
      dataStats: stats,
      cacheStats: {
        size: searchCache.size(),
      },
      rateLimitStats,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response): void => {
  res.status(404).json({
    data: { error: 'Endpoint not found' }
  });
});

// Error handler
app.use((error: any, req: Request, res: Response, next: any): void => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    data: { error: 'Internal server error' }
  });
});

export default app;
