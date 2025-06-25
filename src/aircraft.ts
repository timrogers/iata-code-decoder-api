import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { OptimizedSearchService } from './optimized-search.js';

export const AIRCRAFT = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];

// Create optimized search service for aircraft
const aircraftSearchService = new OptimizedSearchService(AIRCRAFT, 3, 50, 100);

export const searchAircraft = (query: string): Aircraft[] => {
  return aircraftSearchService.search(query) as Aircraft[];
};

export const clearAircraftCache = (): void => {
  aircraftSearchService.clearCache();
};

export const getAircraftCacheStats = () => {
  return aircraftSearchService.getCacheStats();
};
