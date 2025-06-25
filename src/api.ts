import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { Keyable, AirportFilters, AirlineFilters, AircraftFilters } from './types.js';
import { 
  applyFilters, 
  extractManufacturer, 
  filterObjectsByPartialIataCode 
} from './utils.js';

const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

app.use(compression());
app.use(morgan('tiny'));

// Helper function to parse query parameters
const parseQueryParams = (query: any): Keyable => {
  const parsed: Keyable = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    
    // Handle boolean parameters
    if (value === 'true') {
      parsed[key] = true;
    } else if (value === 'false') {
      parsed[key] = false;
    }
    // Handle numeric parameters
    else if (!isNaN(Number(value)) && key.includes('latitude') || key.includes('longitude') || key.includes('limit') || key.includes('offset')) {
      parsed[key] = Number(value);
    }
    // Handle string parameters
    else {
      parsed[key] = String(value);
    }
  }
  
  return parsed;
};

// Enhanced aircraft data with manufacturer extraction
const enhancedAircraft = AIRCRAFT.map(aircraft => ({
  ...aircraft,
  manufacturer: extractManufacturer(aircraft.name)
}));

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

  const availableFilters = [
    'query', 'iataCode', 'icaoCode', 'name', 'cityName', 'country', 'timezone',
    'minLatitude', 'maxLatitude', 'minLongitude', 'maxLongitude',
    'hasIcaoCode', 'hasCity', 'limit', 'offset', 'sortBy', 'sortOrder'
  ];

  // Legacy support: if only 'query' is provided, use old filtering
  if (req.query.query && Object.keys(req.query).length === 1) {
    const query = req.query.query as string;
    if (query === undefined || query === '') {
      res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
      return;
    }
    const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
    res.json({ data: airports });
    return;
  }

  try {
    const filters = parseQueryParams(req.query) as AirportFilters;
    
    // Map country filter to iataCountryCode
    if (filters.country) {
      filters.iataCountryCode = filters.country;
      delete filters.country;
    }
    
    const result = applyFilters(AIRPORTS, filters, availableFilters);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: 'Invalid filter parameters',
      availableFilters,
      message: (error as Error).message
    });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  const availableFilters = [
    'query', 'iataCode', 'name', 'limit', 'offset', 'sortBy', 'sortOrder'
  ];

  // Legacy support: if only 'query' is provided, use old filtering
  if (req.query.query && Object.keys(req.query).length === 1) {
    const query = req.query.query as string;
    if (query === undefined || query === '') {
      res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
      return;
    }
    const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);
    res.json({ data: airlines });
    return;
  }

  try {
    const filters = parseQueryParams(req.query) as AirlineFilters;
    const result = applyFilters(AIRLINES, filters, availableFilters);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: 'Invalid filter parameters',
      availableFilters,
      message: (error as Error).message
    });
  }
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  const availableFilters = [
    'query', 'iataCode', 'name', 'manufacturer', 'limit', 'offset', 'sortBy', 'sortOrder'
  ];

  // Legacy support: if only 'query' is provided, use old filtering
  if (req.query.query && Object.keys(req.query).length === 1) {
    const query = req.query.query as string;
    if (query === undefined || query === '') {
      res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
      return;
    }
    const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
    res.json({ data: aircraft });
    return;
  }

  try {
    const filters = parseQueryParams(req.query) as AircraftFilters;
    const result = applyFilters(enhancedAircraft, filters, availableFilters);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: 'Invalid filter parameters',
      availableFilters,
      message: (error as Error).message
    });
  }
});

// New endpoint to get available filters and their descriptions
app.get('/filters', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS * 7}`); // Cache for a week

  const filterDocumentation = {
    airports: {
      query: {
        type: 'string',
        description: 'Full-text search across all airport fields (name, city, IATA code, etc.)',
        example: 'London'
      },
      iataCode: {
        type: 'string',
        description: 'Filter by IATA airport code (partial matching supported)',
        example: 'LHR'
      },
      icaoCode: {
        type: 'string',
        description: 'Filter by ICAO airport code (partial matching supported)',
        example: 'EGLL'
      },
      name: {
        type: 'string',
        description: 'Filter by airport name (partial matching supported)',
        example: 'Heathrow'
      },
      cityName: {
        type: 'string',
        description: 'Filter by city name (partial matching supported)',
        example: 'London'
      },
      country: {
        type: 'string',
        description: 'Filter by country code (2-letter ISO code)',
        example: 'GB'
      },
      timezone: {
        type: 'string',
        description: 'Filter by timezone (partial matching supported)',
        example: 'Europe/London'
      },
      minLatitude: {
        type: 'number',
        description: 'Minimum latitude for geographic filtering',
        example: 51.0
      },
      maxLatitude: {
        type: 'number',
        description: 'Maximum latitude for geographic filtering',
        example: 52.0
      },
      minLongitude: {
        type: 'number',
        description: 'Minimum longitude for geographic filtering',
        example: -1.0
      },
      maxLongitude: {
        type: 'number',
        description: 'Maximum longitude for geographic filtering',
        example: 0.0
      },
      hasIcaoCode: {
        type: 'boolean',
        description: 'Filter airports that have/don\'t have ICAO codes',
        example: true
      },
      hasCity: {
        type: 'boolean',
        description: 'Filter airports that have/don\'t have city information',
        example: true
      }
    },
    airlines: {
      query: {
        type: 'string',
        description: 'Full-text search across all airline fields (name, IATA code, etc.)',
        example: 'British'
      },
      iataCode: {
        type: 'string',
        description: 'Filter by IATA airline code (partial matching supported)',
        example: 'BA'
      },
      name: {
        type: 'string',
        description: 'Filter by airline name (partial matching supported)',
        example: 'Airways'
      }
    },
    aircraft: {
      query: {
        type: 'string',
        description: 'Full-text search across all aircraft fields (name, IATA code, manufacturer, etc.)',
        example: 'Boeing'
      },
      iataCode: {
        type: 'string',
        description: 'Filter by IATA aircraft code (partial matching supported)',
        example: '737'
      },
      name: {
        type: 'string',
        description: 'Filter by aircraft name (partial matching supported)',
        example: '737-800'
      },
      manufacturer: {
        type: 'string',
        description: 'Filter by aircraft manufacturer (extracted from name)',
        example: 'Boeing'
      }
    },
    common: {
      limit: {
        type: 'number',
        description: 'Number of results to return (default: 100, max: 1000)',
        example: 50
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip for pagination (default: 0)',
        example: 100
      },
      sortBy: {
        type: 'string',
        description: 'Field to sort by (any field in the data)',
        example: 'name'
      },
      sortOrder: {
        type: 'string',
        description: 'Sort order: "asc" or "desc" (default: "asc")',
        example: 'desc'
      }
    }
  };

  res.json({
    documentation: filterDocumentation,
    examples: {
      airports: {
        search_london_airports: '/airports?query=London&limit=10',
        uk_airports: '/airports?country=GB&sortBy=name',
        large_airports_with_icao: '/airports?hasIcaoCode=true&limit=50',
        airports_in_region: '/airports?minLatitude=51&maxLatitude=52&minLongitude=-1&maxLongitude=0'
      },
      airlines: {
        search_british_airlines: '/airlines?query=British&sortBy=name',
        ba_airlines: '/airlines?iataCode=BA',
        all_airlines_paginated: '/airlines?limit=25&offset=50&sortBy=name&sortOrder=asc'
      },
      aircraft: {
        boeing_aircraft: '/aircraft?manufacturer=Boeing&limit=20',
        search_737: '/aircraft?query=737&sortBy=name',
        wide_body_aircraft: '/aircraft?query=wide&sortBy=manufacturer'
      }
    }
  });
});

export default app;
