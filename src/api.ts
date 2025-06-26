import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import responseTime from 'response-time';
import helmet from 'helmet';
import { AIRPORTS_LOOKUP } from './airports.js';
import { AIRLINES_LOOKUP } from './airlines.js';
import { AIRCRAFT_LOOKUP } from './aircraft.js';
import { ResponseCache } from './utils.js';

const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

// Performance optimization: Response caching
const responseCache = new ResponseCache(300); // 5-minute cache

// Performance optimization: Cleanup cache periodically
setInterval(() => {
  responseCache.cleanup();
}, 60000); // Clean every minute

// Performance optimization: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security and performance middleware
app.use(helmet()); // Security headers
app.use(responseTime()); // Add X-Response-Time header
app.use(limiter); // Rate limiting
app.use(compression()); // Response compression
app.use(morgan('tiny')); // Logging

// Helper function to create cache keys
const createCacheKey = (endpoint: string, query: string): string => {
  return `${endpoint}:${query.toLowerCase()}`;
};

// Performance metrics tracking
let requestMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  avgResponseTime: 0,
  errorCount: 0,
};

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  res.status(200).json({ success: true });
});

// Performance monitoring endpoint
app.get('/metrics', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const cacheHitRate = requestMetrics.totalRequests > 0 
    ? (requestMetrics.cacheHits / requestMetrics.totalRequests * 100).toFixed(2)
    : '0.00';

  res.status(200).json({
    ...requestMetrics,
    cacheHitRate: `${cacheHitRate}%`,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

app.get('/airports', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  requestMetrics.totalRequests++;

  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    requestMetrics.errorCount++;
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }

  const query = req.query.query as string;
  const cacheKey = createCacheKey('airports', query);

  // Check cache first
  const cachedResult = responseCache.get(cacheKey);
  if (cachedResult) {
    requestMetrics.cacheHits++;
    res.json(cachedResult);
    return;
  }

  // Performance optimization: Use optimized lookup instead of linear search
  const airports = AIRPORTS_LOOKUP.searchByPrefix(query, 3);
  const result = { data: airports };

  // Cache the result
  responseCache.set(cacheKey, result);
  
  // Update metrics
  const responseTime = Date.now() - startTime;
  requestMetrics.avgResponseTime = 
    (requestMetrics.avgResponseTime * (requestMetrics.totalRequests - 1) + responseTime) / requestMetrics.totalRequests;

  res.json(result);
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  requestMetrics.totalRequests++;

  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    requestMetrics.errorCount++;
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }

  const query = req.query.query as string;
  const cacheKey = createCacheKey('airlines', query);

  // Check cache first
  const cachedResult = responseCache.get(cacheKey);
  if (cachedResult) {
    requestMetrics.cacheHits++;
    res.json(cachedResult);
    return;
  }

  // Performance optimization: Use optimized lookup instead of linear search
  const airlines = AIRLINES_LOOKUP.searchByPrefix(query, 2);
  const result = { data: airlines };

  // Cache the result
  responseCache.set(cacheKey, result);
  
  // Update metrics
  const responseTime = Date.now() - startTime;
  requestMetrics.avgResponseTime = 
    (requestMetrics.avgResponseTime * (requestMetrics.totalRequests - 1) + responseTime) / requestMetrics.totalRequests;

  res.json(result);
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  requestMetrics.totalRequests++;

  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    requestMetrics.errorCount++;
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }

  const query = req.query.query as string;
  const cacheKey = createCacheKey('aircraft', query);

  // Check cache first
  const cachedResult = responseCache.get(cacheKey);
  if (cachedResult) {
    requestMetrics.cacheHits++;
    res.json(cachedResult);
    return;
  }

  // Performance optimization: Use optimized lookup instead of linear search
  const aircraft = AIRCRAFT_LOOKUP.searchByPrefix(query, 3);
  const result = { data: aircraft };

  // Cache the result
  responseCache.set(cacheKey, result);
  
  // Update metrics
  const responseTime = Date.now() - startTime;
  requestMetrics.avgResponseTime = 
    (requestMetrics.avgResponseTime * (requestMetrics.totalRequests - 1) + responseTime) / requestMetrics.totalRequests;

  res.json(result);
});

export default app;
