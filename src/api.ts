import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { searchAirports, getAirportCacheStats, clearAirportCache } from './airports.js';
import { searchAirlines, getAirlineCacheStats, clearAirlineCache } from './airlines.js';
import { searchAircraft, getAircraftCacheStats, clearAircraftCache } from './aircraft.js';

const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};

const INVALID_QUERY_ERROR = {
  data: {
    error: 'Query must be a non-empty string',
  },
};

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const ONE_HOUR_IN_SECONDS = 60 * 60;

// Enable trust proxy for better performance monitoring
app.set('trust proxy', true);

app.use(compression({ level: 6, threshold: 1024 }));
app.use(morgan('tiny'));

// Add response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    return originalSend.call(this, data);
  };
  next();
});

// Input validation middleware
const validateQuery = (req: Request, res: Response, next: express.NextFunction): void => {
  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }
  
  const query = req.query.query as string;
  if (typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json(INVALID_QUERY_ERROR);
    return;
  }
  
  // Limit query length to prevent abuse
  if (query.length > 10) {
    res.status(400).json({
      data: {
        error: 'Query must be 10 characters or less',
      },
    });
    return;
  }
  
  next();
};

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  res.status(200).json({ success: true });
});

// Cache stats endpoint for monitoring
app.get('/stats', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_HOUR_IN_SECONDS}`);

  const stats = {
    cache: {
      airports: getAirportCacheStats(),
      airlines: getAirlineCacheStats(),
      aircraft: getAircraftCacheStats(),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(stats);
});

// Cache clear endpoint for debugging
app.post('/cache/clear', async (req: Request, res: Response): Promise<void> => {
  clearAirportCache();
  clearAirlineCache();
  clearAircraftCache();
  
  res.status(200).json({ 
    success: true, 
    message: 'All caches cleared',
    timestamp: new Date().toISOString(),
  });
});

app.get('/airports', validateQuery, async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const query = req.query.query as string;
    const airports = searchAirports(query.trim());
    
    res.json({ 
      data: airports,
      count: airports.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Error searching airports:', error);
    res.status(500).json({
      data: {
        error: 'Internal server error while searching airports',
      },
    });
  }
});

app.get('/airlines', validateQuery, async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const query = req.query.query as string;
    const airlines = searchAirlines(query.trim());

    res.json({
      data: airlines,
      count: airlines.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Error searching airlines:', error);
    res.status(500).json({
      data: {
        error: 'Internal server error while searching airlines',
      },
    });
  }
});

app.get('/aircraft', validateQuery, async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const query = req.query.query as string;
    const aircraft = searchAircraft(query.trim());
    
    res.json({ 
      data: aircraft,
      count: aircraft.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Error searching aircraft:', error);
    res.status(500).json({
      data: {
        error: 'Internal server error while searching aircraft',
      },
    });
  }
});

export default app;
