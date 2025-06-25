import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { OptimizedSearchService } from './optimized-search.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    }) as Airport;
  } else {
    return camelisedAirport as Airport;
  }
};

export const AIRPORTS: Airport[] = AIRPORTS_DATA.map(airportDataToAirport);

// Create optimized search service for airports
const airportSearchService = new OptimizedSearchService(AIRPORTS, 3, 50, 500);

export const searchAirports = (query: string): Airport[] => {
  return airportSearchService.search(query) as Airport[];
};

export const clearAirportCache = (): void => {
  airportSearchService.clearCache();
};

export const getAirportCacheStats = () => {
  return airportSearchService.getCacheStats();
};
