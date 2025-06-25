import { Airline, Keyable } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { OptimizedSearchService } from './optimized-search.js';

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

export const AIRLINES: Airline[] = AIRLINES_DATA.map(cameliseKeys).filter(
  hasIataCode,
) as Airline[];

// Create optimized search service for airlines
const airlineSearchService = new OptimizedSearchService(AIRLINES, 2, 50, 200);

export const searchAirlines = (query: string): Airline[] => {
  return airlineSearchService.search(query) as Airline[];
};

export const clearAirlineCache = (): void => {
  airlineSearchService.clearCache();
};

export const getAirlineCacheStats = () => {
  return airlineSearchService.getCacheStats();
};
