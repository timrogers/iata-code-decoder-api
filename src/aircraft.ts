import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys, OptimizedLookup } from './utils.js';

const processedAircraft: Aircraft[] = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];

// Performance optimization: Use optimized lookup instead of plain array
export const AIRCRAFT_LOOKUP = new OptimizedLookup(processedAircraft, 3);

// Keep original export for backward compatibility (deprecated)
export const AIRCRAFT = processedAircraft;
