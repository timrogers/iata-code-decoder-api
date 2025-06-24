import { Airport, Airline, Aircraft } from './types.js';

const snakeCaseToCamelCase = (string: string): string =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

export const cameliseKeys = (object: object): object =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

export interface FilterOptions {
  // Common filters
  query?: string;
  iataCode?: string | string[];
  name?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fields?: string[];
  
  // Airport-specific filters
  country?: string | string[];
  city?: string;
  timezone?: string | string[];
  latitude?: { min?: number; max?: number };
  longitude?: { min?: number; max?: number };
  icaoCode?: string | string[];
  
  // Airline-specific filters
  hasLogo?: boolean;
  hasConditions?: boolean;
  
  // Aircraft-specific filters
  manufacturer?: string | string[];
  aircraftType?: string;
}

export interface PaginatedResults<T> {
  data: T[];
  hasMore: boolean;
}

// Parse query parameters into filter options
export function parseFilters(query: any): FilterOptions {
  const filters: FilterOptions = {
    limit: 50, // default limit
    offset: 0,  // default offset
    sortOrder: 'asc' // default sort order
  };

  // Parse common filters
  if (query.query) filters.query = query.query;
  if (query.iataCode) filters.iataCode = Array.isArray(query.iataCode) ? query.iataCode : [query.iataCode];
  if (query.name) filters.name = query.name;
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      throw new Error('Limit must be a number between 1 and 1000');
    }
    filters.limit = limit;
  }
  if (query.offset) {
    const offset = parseInt(query.offset);
    if (isNaN(offset) || offset < 0) {
      throw new Error('Offset must be a non-negative number');
    }
    filters.offset = offset;
  }
  if (query.sortBy) filters.sortBy = query.sortBy;
  if (query.sortOrder && (query.sortOrder === 'asc' || query.sortOrder === 'desc')) {
    filters.sortOrder = query.sortOrder;
  }
  if (query.fields) {
    filters.fields = Array.isArray(query.fields) ? query.fields : query.fields.split(',');
  }

  // Parse airport-specific filters
  if (query.country) filters.country = Array.isArray(query.country) ? query.country : [query.country];
  if (query.city) filters.city = query.city;
  if (query.timezone) filters.timezone = Array.isArray(query.timezone) ? query.timezone : [query.timezone];
  if (query.icaoCode) filters.icaoCode = Array.isArray(query.icaoCode) ? query.icaoCode : [query.icaoCode];
  
  // Parse coordinate filters
  if (query.latMin || query.latMax) {
    filters.latitude = {};
    if (query.latMin) {
      const latMin = parseFloat(query.latMin);
      if (!isNaN(latMin) && latMin >= -90 && latMin <= 90) filters.latitude.min = latMin;
    }
    if (query.latMax) {
      const latMax = parseFloat(query.latMax);
      if (!isNaN(latMax) && latMax >= -90 && latMax <= 90) filters.latitude.max = latMax;
    }
  }
  if (query.lngMin || query.lngMax) {
    filters.longitude = {};
    if (query.lngMin) {
      const lngMin = parseFloat(query.lngMin);
      if (!isNaN(lngMin) && lngMin >= -180 && lngMin <= 180) filters.longitude.min = lngMin;
    }
    if (query.lngMax) {
      const lngMax = parseFloat(query.lngMax);
      if (!isNaN(lngMax) && lngMax >= -180 && lngMax <= 180) filters.longitude.max = lngMax;
    }
  }

  // Parse airline-specific filters
  if (query.hasLogo) filters.hasLogo = query.hasLogo === 'true';
  if (query.hasConditions) filters.hasConditions = query.hasConditions === 'true';

  // Parse aircraft-specific filters
  if (query.manufacturer) filters.manufacturer = Array.isArray(query.manufacturer) ? query.manufacturer : [query.manufacturer];
  if (query.aircraftType) filters.aircraftType = query.aircraftType;

  return filters;
}

// Generic text search function
function matchesTextSearch(text: string, searchTerm: string): boolean {
  if (!searchTerm) return true;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

// Generic array match function
function matchesArrayFilter<T>(value: T, filter: T | T[]): boolean {
  if (!filter) return true;
  if (Array.isArray(filter)) {
    return filter.some(filterValue => 
      String(value).toLowerCase() === String(filterValue).toLowerCase()
    );
  }
  return String(value).toLowerCase() === String(filter).toLowerCase();
}

// Airport filtering function
export function filterAirports(airports: Airport[], filters: FilterOptions): Airport[] {
  return airports.filter(airport => {
    // Text search across multiple fields
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      const searchableText = [
        airport.name,
        airport.iataCode,
        airport.icaoCode,
        airport.cityName,
        airport.iataCountryCode
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) return false;
    }

    // IATA code filter
    if (filters.iataCode && !matchesArrayFilter(airport.iataCode, filters.iataCode)) {
      return false;
    }

    // ICAO code filter
    if (filters.icaoCode && !matchesArrayFilter(airport.icaoCode, filters.icaoCode)) {
      return false;
    }

    // Name filter
    if (filters.name && !matchesTextSearch(airport.name, filters.name)) {
      return false;
    }

    // Country filter
    if (filters.country && !matchesArrayFilter(airport.iataCountryCode, filters.country)) {
      return false;
    }

    // City filter
    if (filters.city && !matchesTextSearch(airport.cityName, filters.city)) {
      return false;
    }

    // Timezone filter
    if (filters.timezone && !matchesArrayFilter(airport.time_zone, filters.timezone)) {
      return false;
    }

    // Latitude filter
    if (filters.latitude) {
      if (filters.latitude.min !== undefined && airport.latitude < filters.latitude.min) return false;
      if (filters.latitude.max !== undefined && airport.latitude > filters.latitude.max) return false;
    }

    // Longitude filter
    if (filters.longitude) {
      if (filters.longitude.min !== undefined && airport.longitude < filters.longitude.min) return false;
      if (filters.longitude.max !== undefined && airport.longitude > filters.longitude.max) return false;
    }

    return true;
  });
}

// Airline filtering function
export function filterAirlines(airlines: Airline[], filters: FilterOptions): Airline[] {
  return airlines.filter(airline => {
    // Text search across multiple fields
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      const searchableText = [
        airline.name,
        airline.iataCode || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) return false;
    }

    // IATA code filter
    if (filters.iataCode && airline.iataCode && !matchesArrayFilter(airline.iataCode, filters.iataCode)) {
      return false;
    }

    // Name filter
    if (filters.name && !matchesTextSearch(airline.name, filters.name)) {
      return false;
    }

    // Logo filter
    if (filters.hasLogo !== undefined) {
      const hasLogo = !!(airline as any).logo_symbol_url;
      if (filters.hasLogo !== hasLogo) return false;
    }

    // Conditions of carriage filter
    if (filters.hasConditions !== undefined) {
      const hasConditions = !!(airline as any).conditions_of_carriage_url;
      if (filters.hasConditions !== hasConditions) return false;
    }

    return true;
  });
}

// Aircraft filtering function
export function filterAircraft(aircraft: Aircraft[], filters: FilterOptions): Aircraft[] {
  return aircraft.filter(plane => {
    // Text search across multiple fields
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      const searchableText = [
        plane.name,
        plane.iataCode
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) return false;
    }

    // IATA code filter
    if (filters.iataCode && !matchesArrayFilter(plane.iataCode, filters.iataCode)) {
      return false;
    }

    // Name filter
    if (filters.name && !matchesTextSearch(plane.name, filters.name)) {
      return false;
    }

    // Manufacturer filter (extracted from name)
    if (filters.manufacturer) {
      const manufacturer = plane.name.split(' ')[0].toLowerCase();
      const manufacturerArray = Array.isArray(filters.manufacturer) ? filters.manufacturer : [filters.manufacturer];
      if (!manufacturerArray.some(m => manufacturer.indexOf(m.toLowerCase()) !== -1)) {
        return false;
      }
    }

    // Aircraft type filter (basic keyword search in name)
    if (filters.aircraftType && !matchesTextSearch(plane.name, filters.aircraftType)) {
      return false;
    }

    return true;
  });
}

// Sorting function
export function sortResults<T extends Record<string, any>>(
  results: T[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return [...results].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
    if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

    // Convert to comparable values
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    else if (aVal > bVal) comparison = 1;

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

// Pagination function
export function paginateResults<T>(
  results: T[], 
  limit: number = 50, 
  offset: number = 0
): PaginatedResults<T> {
  const startIndex = offset;
  const endIndex = startIndex + limit;
  const paginatedData = results.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    hasMore: endIndex < results.length
  };
}

// Field selection function
export function selectFields<T extends Record<string, any>>(
  items: T[], 
  fields?: string[]
): Partial<T>[] {
  if (!fields || fields.length === 0) return items;
  
  return items.map(item => {
    const selectedItem: Partial<T> = {};
    fields.forEach(field => {
      if (field in item) {
        selectedItem[field as keyof T] = item[field];
      }
    });
    return selectedItem;
  });
}
