import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { Keyable } from './types.js';
const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

// Security Headers Configuration
app.use(
  helmet({
    // Content Security Policy - restrictive for API
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'none'"],
        imgSrc: ["'none'"],
        connectSrc: ["'none'"],
        fontSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    // Enforce HTTPS in production
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Prevent MIME sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Referrer Policy
    referrerPolicy: { policy: 'no-referrer' },
    // Permissions Policy (Feature Policy)
    permittedCrossDomainPolicies: false,
    // Cross Origin Embedder Policy
    crossOriginEmbedderPolicy: false,
    // Cross Origin Opener Policy
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // Cross Origin Resource Policy
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// CORS Configuration
app.use(
  cors({
    // Allow requests from any origin for public API
    origin: true,
    // Allow common HTTP methods
    methods: ['GET', 'HEAD', 'OPTIONS'],
    // Allow common headers
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    // Don't expose credentials for public API
    credentials: false,
    // Cache preflight requests for 24 hours
    maxAge: 86400,
    // Don't allow credentials
    optionsSuccessStatus: 200,
  }),
);

// Additional custom security headers
app.use((req: Request, res: Response, next) => {
  // Prevent browsers from guessing content type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // API version header for API management
  res.setHeader('X-API-Version', '1.0.0');

  // Rate limiting information (placeholder - implement actual rate limiting)
  res.setHeader('X-RateLimit-Limit', '1000');
  res.setHeader('X-RateLimit-Remaining', '999');

  // Security contact
  res.setHeader('X-Security-Contact', 'security@example.com');

  // Prevent caching of error responses
  if (res.statusCode >= 400) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
});

app.use(compression());
app.use(morgan('tiny'));

const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable | undefined => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  res.status(200).json({ success: true });
});

app.get('/airports', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
    res.json({ data: airports });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);

    res.json({
      data: airlines,
    });
  }
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
    res.json({ data: aircraft });
  }
});

export default app;
