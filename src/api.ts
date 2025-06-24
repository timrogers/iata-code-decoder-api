import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
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

// Configure security headers with helmet
app.use(helmet({
  // Content Security Policy - restrictive for API
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  // Cross Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  // Cross Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // Frameguard (X-Frame-Options)
  frameguard: { action: 'deny' },
  // Hide Powered By header
  hidePoweredBy: true,
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // IE No Open
  ieNoOpen: true,
  // X-Content-Type-Options
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,
  // Permissions Policy
  permittedCrossDomainPolicies: false,
  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  // X-XSS-Protection
  xssFilter: true,
}));

// Additional security headers not covered by helmet
app.use((req, res, next) => {
  // Permissions Policy - disable all potentially sensitive features for API
  res.setHeader('Permissions-Policy', [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
    'interest-cohort=()'
  ].join(', '));
  
  // X-Robots-Tag for API endpoints
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  
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
