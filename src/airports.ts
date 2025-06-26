import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys, OptimizedLookup } from './utils.js';

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

const processedAirports: Airport[] = AIRPORTS_DATA.map(airportDataToAirport);

// Performance optimization: Use optimized lookup instead of plain array
export const AIRPORTS_LOOKUP = new OptimizedLookup(processedAirports, 3);

// Keep original export for backward compatibility (deprecated)
export const AIRPORTS: Airport[] = processedAirports;
