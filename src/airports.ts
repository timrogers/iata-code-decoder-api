import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as unknown as Airport & { timeZone?: string };

  if (camelisedAirport.city) {
    // Optimised: mutate the existing object instead of using Object.assign to avoid extra allocations
    (camelisedAirport as unknown as Record<string, unknown>).city = cameliseKeys(camelisedAirport.city);
  }

  // Restore the original snake_case time_zone key to satisfy the response schema
  // and maintain backward compatibility.
  if (camelisedAirport.timeZone) {
    (camelisedAirport as unknown as Record<string, unknown>).time_zone = camelisedAirport.timeZone;
  }

  return camelisedAirport;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
