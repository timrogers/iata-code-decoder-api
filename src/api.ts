import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { Keyable, Airport, Airline, Aircraft } from './types.js';
import { 
  filterAirports, 
  filterAirlines, 
  filterAircraft,
  parseFilters,
  paginateResults,
  sortResults,
  selectFields
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

// Legacy filter function for backward compatibility
const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable[] => {
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

  try {
    const filters = parseFilters(req.query);
    
    // Backward compatibility: if only 'query' is provided, use legacy filtering
    if (req.query.query && Object.keys(req.query).length === 1) {
      if (req.query.query === undefined || req.query.query === '') {
        res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
        return;
      }
      const query = req.query.query as string;
      const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
      res.json({ data: airports });
      return;
    }

    let results = filterAirports(AIRPORTS as Airport[], filters);
    
    // Apply sorting
    if (filters.sortBy) {
      results = sortResults(results, filters.sortBy, filters.sortOrder);
    }
    
    // Apply pagination
    const paginatedResults = paginateResults(results, filters.limit, filters.offset);
    
    // Apply field selection if specified
    const selectedData = filters.fields ? selectFields(paginatedResults.data, filters.fields) : paginatedResults.data;
    
    res.json({
      data: selectedData,
      pagination: {
        total: results.length,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: paginatedResults.hasMore
      },
      filters: filters
    });
  } catch (error) {
    res.status(400).json({
      data: {
        error: error instanceof Error ? error.message : 'Invalid filter parameters'
      }
    });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const filters = parseFilters(req.query);
    
    // Backward compatibility: if only 'query' is provided, use legacy filtering
    if (req.query.query && Object.keys(req.query).length === 1) {
      if (req.query.query === undefined || req.query.query === '') {
        res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
        return;
      }
      const query = req.query.query as string;
      const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);
      res.json({ data: airlines });
      return;
    }

    let results = filterAirlines(AIRLINES as Airline[], filters);
    
    // Apply sorting
    if (filters.sortBy) {
      results = sortResults(results, filters.sortBy, filters.sortOrder);
    }
    
    // Apply pagination
    const paginatedResults = paginateResults(results, filters.limit, filters.offset);
    
    // Apply field selection if specified
    const selectedData = filters.fields ? selectFields(paginatedResults.data, filters.fields) : paginatedResults.data;
    
    res.json({
      data: selectedData,
      pagination: {
        total: results.length,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: paginatedResults.hasMore
      },
      filters: filters
    });
  } catch (error) {
    res.status(400).json({
      data: {
        error: error instanceof Error ? error.message : 'Invalid filter parameters'
      }
    });
  }
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const filters = parseFilters(req.query);
    
    // Backward compatibility: if only 'query' is provided, use legacy filtering
    if (req.query.query && Object.keys(req.query).length === 1) {
      if (req.query.query === undefined || req.query.query === '') {
        res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
        return;
      }
      const query = req.query.query as string;
      const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
      res.json({ data: aircraft });
      return;
    }

    let results = filterAircraft(AIRCRAFT as Aircraft[], filters);
    
    // Apply sorting
    if (filters.sortBy) {
      results = sortResults(results, filters.sortBy, filters.sortOrder);
    }
    
    // Apply pagination
    const paginatedResults = paginateResults(results, filters.limit, filters.offset);
    
    // Apply field selection if specified
    const selectedData = filters.fields ? selectFields(paginatedResults.data, filters.fields) : paginatedResults.data;
    
    res.json({
      data: selectedData,
      pagination: {
        total: results.length,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: paginatedResults.hasMore
      },
      filters: filters
    });
  } catch (error) {
    res.status(400).json({
      data: {
        error: error instanceof Error ? error.message : 'Invalid filter parameters'
      }
    });
  }
});

// Documentation endpoint
app.get('/docs', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  const documentation = {
    title: 'IATA Code Decoder API - Comprehensive Filtering Documentation',
    version: '2.0.0',
    description: 'Enhanced API with extensive filtering, sorting, pagination, and field selection capabilities',
    
    endpoints: {
      '/airports': {
        method: 'GET',
        description: 'Search and filter airports',
        parameters: {
          // Common filters
          query: { type: 'string', description: 'Text search across name, IATA code, ICAO code, city, and country' },
          iataCode: { type: 'string|string[]', description: 'Filter by specific IATA code(s)' },
          name: { type: 'string', description: 'Filter by airport name (partial match)' },
          
          // Airport-specific filters
          country: { type: 'string|string[]', description: 'Filter by country code(s)' },
          city: { type: 'string', description: 'Filter by city name (partial match)' },
          timezone: { type: 'string|string[]', description: 'Filter by timezone(s)' },
          icaoCode: { type: 'string|string[]', description: 'Filter by ICAO code(s)' },
          latMin: { type: 'number', description: 'Minimum latitude (-90 to 90)' },
          latMax: { type: 'number', description: 'Maximum latitude (-90 to 90)' },
          lngMin: { type: 'number', description: 'Minimum longitude (-180 to 180)' },
          lngMax: { type: 'number', description: 'Maximum longitude (-180 to 180)' },
          
          // Common parameters
          limit: { type: 'number', description: 'Number of results per page (1-1000, default: 50)' },
          offset: { type: 'number', description: 'Number of results to skip (default: 0)' },
          sortBy: { type: 'string', description: 'Field to sort by (name, iataCode, cityName, etc.)' },
          sortOrder: { type: 'string', description: 'Sort order: asc or desc (default: asc)' },
          fields: { type: 'string|string[]', description: 'Comma-separated list of fields to return' }
        },
        examples: [
          '/airports?query=london',
          '/airports?country=US&limit=10',
          '/airports?latMin=40&latMax=50&lngMin=-10&lngMax=10',
          '/airports?fields=name,iataCode,cityName&sortBy=name'
        ]
      },
      
      '/airlines': {
        method: 'GET',
        description: 'Search and filter airlines',
        parameters: {
          // Common filters
          query: { type: 'string', description: 'Text search across name and IATA code' },
          iataCode: { type: 'string|string[]', description: 'Filter by specific IATA code(s)' },
          name: { type: 'string', description: 'Filter by airline name (partial match)' },
          
          // Airline-specific filters
          hasLogo: { type: 'boolean', description: 'Filter airlines that have/don\'t have logos' },
          hasConditions: { type: 'boolean', description: 'Filter airlines that have/don\'t have conditions of carriage' },
          
          // Common parameters
          limit: { type: 'number', description: 'Number of results per page (1-1000, default: 50)' },
          offset: { type: 'number', description: 'Number of results to skip (default: 0)' },
          sortBy: { type: 'string', description: 'Field to sort by (name, iataCode, etc.)' },
          sortOrder: { type: 'string', description: 'Sort order: asc or desc (default: asc)' },
          fields: { type: 'string|string[]', description: 'Comma-separated list of fields to return' }
        },
        examples: [
          '/airlines?query=american',
          '/airlines?hasLogo=true&limit=20',
          '/airlines?fields=name,iataCode&sortBy=name',
          '/airlines?hasConditions=false'
        ]
      },
      
      '/aircraft': {
        method: 'GET',
        description: 'Search and filter aircraft',
        parameters: {
          // Common filters
          query: { type: 'string', description: 'Text search across name and IATA code' },
          iataCode: { type: 'string|string[]', description: 'Filter by specific IATA code(s)' },
          name: { type: 'string', description: 'Filter by aircraft name (partial match)' },
          
          // Aircraft-specific filters
          manufacturer: { type: 'string|string[]', description: 'Filter by manufacturer(s) (extracted from name)' },
          aircraftType: { type: 'string', description: 'Filter by aircraft type (keyword search in name)' },
          
          // Common parameters
          limit: { type: 'number', description: 'Number of results per page (1-1000, default: 50)' },
          offset: { type: 'number', description: 'Number of results to skip (default: 0)' },
          sortBy: { type: 'string', description: 'Field to sort by (name, iataCode, etc.)' },
          sortOrder: { type: 'string', description: 'Sort order: asc or desc (default: asc)' },
          fields: { type: 'string|string[]', description: 'Comma-separated list of fields to return' }
        },
        examples: [
          '/aircraft?query=boeing',
          '/aircraft?manufacturer=Airbus&limit=15',
          '/aircraft?aircraftType=737&fields=name,iataCode',
          '/aircraft?sortBy=name&sortOrder=desc'
        ]
      }
    },
    
    features: {
      'Backward Compatibility': 'Legacy ?query parameter still works for simple IATA code prefix searches',
      'Text Search': 'Search across multiple relevant fields simultaneously',
      'Multiple Filters': 'Combine multiple filters using AND logic',
      'Array Filters': 'Pass multiple values for certain filters (e.g., ?country=US&country=CA)',
      'Geographic Filtering': 'Filter airports by coordinate ranges',
      'Pagination': 'Efficient pagination with limit/offset and hasMore indicator',
      'Sorting': 'Sort results by any field in ascending or descending order',
      'Field Selection': 'Return only specific fields to reduce response size',
      'Validation': 'Comprehensive input validation with clear error messages'
    },
    
    responseFormat: {
      data: 'Array of filtered results',
      pagination: {
        total: 'Total number of results (before pagination)',
        limit: 'Results per page',
        offset: 'Number of results skipped',
        hasMore: 'Boolean indicating if more results are available'
      },
      filters: 'Applied filter parameters for reference'
    }
  };

  res.json(documentation);
});

export default app;
