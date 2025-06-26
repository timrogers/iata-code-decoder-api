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

// Security headers configuration
app.use(
  helmet({
    // Content Security Policy - prevents XSS attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Set to true if you need it
    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: "same-origin" },
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    // Frame Options - prevents clickjacking
    frameguard: { action: 'deny' },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // HTTP Strict Transport Security - forces HTTPS
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // IE No Open - sets X-Download-Options for IE8+
    ieNoOpen: true,
    // Don't sniff content type
    noSniff: true,
    // Origin Agent Cluster
    originAgentCluster: true,
    // Permissions Policy (formerly Feature Policy)
    permittedCrossDomainPolicies: false,
    // Referrer Policy
    referrerPolicy: { policy: "no-referrer" },
    // XSS Filter
    xssFilter: true,
  }),
);

// Additional custom security headers
app.use((req, res, next) => {
  // Remove server header for security
  res.removeHeader('X-Powered-By');
  
  // Permissions Policy (Feature Policy) - restricts browser features
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()');
  
  // Expect-CT header for Certificate Transparency
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  
  // Cache-Control for API responses (will be overridden per endpoint as needed)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  
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
