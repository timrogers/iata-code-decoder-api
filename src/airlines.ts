import { Airline, Keyable } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };
import { cameliseKeys, OptimizedLookup } from './utils.js';

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

const processedAirlines: Airline[] = AIRLINES_DATA.map(cameliseKeys).filter(
  hasIataCode,
) as Airline[];

// Performance optimization: Use optimized lookup instead of plain array
export const AIRLINES_LOOKUP = new OptimizedLookup(processedAirlines, 2);

// Keep original export for backward compatibility (deprecated)
export const AIRLINES: Airline[] = processedAirlines;
