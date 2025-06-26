import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { AIRPORTS } from './airports.js';
import { AIRLINES } from './airlines.js';
import { AIRCRAFT } from './aircraft.js';
import { Keyable, Airport, Airline, Aircraft } from './types.js';

const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

app.use(compression());
app.use(morgan('tiny'));

// Enhanced filtering functions
const normalizeString = (str: string): string => str?.toLowerCase().trim() || '';

const matchesStringFilter = (value: string, filter: string, exact: boolean = false): boolean => {
  if (!filter) return true;
  const normalizedValue = normalizeString(value);
  const normalizedFilter = normalizeString(filter);
  return exact ? normalizedValue === normalizedFilter : normalizedValue.includes(normalizedFilter);
};

const matchesArrayFilter = (value: string, filters: string[], exact: boolean = false): boolean => {
  if (!filters || filters.length === 0) return true;
  return filters.some(filter => matchesStringFilter(value, filter, exact));
};

const matchesNumericRange = (value: number, min?: number, max?: number): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

const filterAirports = (airports: Airport[], filters: any): Airport[] => {
  return airports.filter(airport => {
    // IATA Code filtering (partial or exact)
    if (filters.iataCode || filters.query) {
      const searchTerm = filters.iataCode || filters.query;
      if (!matchesStringFilter(airport.iataCode, searchTerm, filters.exact === 'true')) {
        return false;
      }
    }

    // IATA Code array filtering  
    if (filters.iataCodes) {
      const codes = Array.isArray(filters.iataCodes) ? filters.iataCodes : filters.iataCodes.split(',');
      if (!matchesArrayFilter(airport.iataCode, codes, true)) {
        return false;
      }
    }

    // ICAO Code filtering
    if (filters.icaoCode) {
      if (!matchesStringFilter(airport.icaoCode, filters.icaoCode, filters.exact === 'true')) {
        return false;
      }
    }

    // Country code filtering
    if (filters.countryCode || filters.country) {
      const countryFilter = filters.countryCode || filters.country;
      if (!matchesStringFilter(airport.iataCountryCode, countryFilter, true)) {
        return false;
      }
    }

    // Airport name filtering
    if (filters.name || filters.airportName) {
      const nameFilter = filters.name || filters.airportName;
      if (!matchesStringFilter(airport.name, nameFilter)) {
        return false;
      }
    }

    // City name filtering
    if (filters.city || filters.cityName) {
      const cityFilter = filters.city || filters.cityName;
      if (!matchesStringFilter(airport.cityName, cityFilter)) {
        return false;
      }
    }

    // Geographic filtering
    if (filters.minLatitude || filters.maxLatitude) {
      const minLat = filters.minLatitude ? parseFloat(filters.minLatitude) : undefined;
      const maxLat = filters.maxLatitude ? parseFloat(filters.maxLatitude) : undefined;
      if (!matchesNumericRange(airport.latitude, minLat, maxLat)) {
        return false;
      }
    }

    if (filters.minLongitude || filters.maxLongitude) {
      const minLng = filters.minLongitude ? parseFloat(filters.minLongitude) : undefined;
      const maxLng = filters.maxLongitude ? parseFloat(filters.maxLongitude) : undefined;
      if (!matchesNumericRange(airport.longitude, minLng, maxLng)) {
        return false;
      }
    }

    return true;
  });
};

const filterAirlines = (airlines: Airline[], filters: any): Airline[] => {
  return airlines.filter(airline => {
    // IATA Code filtering (partial or exact)
    if (filters.iataCode || filters.query) {
      const searchTerm = filters.iataCode || filters.query;
      if (!airline.iataCode || !matchesStringFilter(airline.iataCode, searchTerm, filters.exact === 'true')) {
        return false;
      }
    }

    // Airline name filtering
    if (filters.name || filters.airlineName) {
      const nameFilter = filters.name || filters.airlineName;
      if (!matchesStringFilter(airline.name, nameFilter)) {
        return false;
      }
    }

    // Logo availability filtering
    if (filters.hasLogo === 'true') {
      if (!airline.logo_symbol_url && !airline.logo_lockup_url) {
        return false;
      }
    }

    return true;
  });
};

const filterAircraft = (aircraft: Aircraft[], filters: any): Aircraft[] => {
  return aircraft.filter(plane => {
    // IATA Code filtering (partial or exact)
    if (filters.iataCode || filters.query) {
      const searchTerm = filters.iataCode || filters.query;
      if (!matchesStringFilter(plane.iataCode, searchTerm, filters.exact === 'true')) {
        return false;
      }
    }

    // Aircraft name filtering
    if (filters.name || filters.aircraftName) {
      const nameFilter = filters.name || filters.aircraftName;
      if (!matchesStringFilter(plane.name, nameFilter)) {
        return false;
      }
    }

    // Manufacturer filtering
    if (filters.manufacturer) {
      if (!matchesStringFilter(plane.name, filters.manufacturer)) {
        return false;
      }
    }

    return true;
  });
};

const applyPagination = (data: any[], page?: string, limit?: string, sortBy?: string, sortOrder?: string) => {
  let result = [...data];

  // Sorting
  if (sortBy) {
    result.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Pagination
  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 50;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedData = result.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: result.length,
      totalPages: Math.ceil(result.length / limitNum),
      hasNext: endIndex < result.length,
      hasPrev: pageNum > 1
    }
  };
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

  // For backward compatibility, require either query or other filters
  if (!req.query.query && !req.query.iataCode && !req.query.name && !req.query.city && !req.query.countryCode) {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }

  try {
    const filteredAirports = filterAirports(AIRPORTS, req.query);
    const result = applyPagination(
      filteredAirports,
      req.query.page as string,
      req.query.limit as string,
      req.query.sortBy as string,
      req.query.sortOrder as string
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      data: { error: 'Internal server error while filtering airports' } 
    });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  // For backward compatibility, require either query or other filters
  if (!req.query.query && !req.query.iataCode && !req.query.name) {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }

  try {
    const filteredAirlines = filterAirlines(AIRLINES, req.query);
    const result = applyPagination(
      filteredAirlines,
      req.query.page as string,
      req.query.limit as string,
      req.query.sortBy as string,
      req.query.sortOrder as string
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      data: { error: 'Internal server error while filtering airlines' } 
    });
  }
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  // For backward compatibility, require either query or other filters
  if (!req.query.query && !req.query.iataCode && !req.query.name && !req.query.manufacturer) {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
    return;
  }

  try {
    const filteredAircraft = filterAircraft(AIRCRAFT, req.query);
    const result = applyPagination(
      filteredAircraft,
      req.query.page as string,
      req.query.limit as string,
      req.query.sortBy as string,
      req.query.sortOrder as string
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      data: { error: 'Internal server error while filtering aircraft' } 
    });
  }
});

// New endpoint for getting filter options/values
app.get('/filters/airports', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const countryCodes = [...new Set(AIRPORTS.map(a => a.iataCountryCode).filter(Boolean))].sort();
    const timeZones = [...new Set(AIRPORTS.map(a => a.time_zone).filter(Boolean))].sort();
    
    res.json({
      data: {
        availableFilters: [
          'query', 'iataCode', 'iataCodes', 'icaoCode', 
          'countryCode', 'name', 'city', 'timezone',
          'minLatitude', 'maxLatitude', 'minLongitude', 'maxLongitude',
          'exact', 'page', 'limit', 'sortBy', 'sortOrder'
        ],
        countryCodes,
        timeZones,
        sortableFields: ['iataCode', 'name', 'cityName', 'iataCountryCode', 'latitude', 'longitude']
      }
    });
  } catch (error) {
    res.status(500).json({ 
      data: { error: 'Internal server error while getting filter options' } 
    });
  }
});

app.get('/filters/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    res.json({
      data: {
        availableFilters: [
          'query', 'iataCode', 'name', 
          'hasLogo', 'exact',
          'page', 'limit', 'sortBy', 'sortOrder'
        ],
        sortableFields: ['iataCode', 'name']
      }
    });
  } catch (error) {
    res.status(500).json({ 
      data: { error: 'Internal server error while getting filter options' } 
    });
  }
});

app.get('/filters/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  try {
    const manufacturers = [...new Set(AIRCRAFT.map(a => {
      const name = a.name.toLowerCase();
      if (name.includes('boeing')) return 'Boeing';
      if (name.includes('airbus')) return 'Airbus';
      if (name.includes('embraer')) return 'Embraer';
      if (name.includes('bombardier')) return 'Bombardier';
      if (name.includes('cessna')) return 'Cessna';
      if (name.includes('gulfstream')) return 'Gulfstream';
      if (name.includes('lockheed')) return 'Lockheed Martin';
      return null;
    }).filter(Boolean))].sort();

    res.json({
      data: {
        availableFilters: [
          'query', 'iataCode', 'name', 
          'manufacturer', 'exact',
          'page', 'limit', 'sortBy', 'sortOrder'
        ],
        manufacturers,
        sortableFields: ['iataCode', 'name']
      }
    });
  } catch (error) {
    res.status(500).json({ 
      data: { error: 'Internal server error while getting filter options' } 
    });
  }
});

export default app;
