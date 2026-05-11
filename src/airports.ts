import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as unknown as Record<string, unknown>;

  // Restore the original snake_case time_zone property.
  // cameliseKeys converts it to timeZone, but the Airport interface and
  // the API response schema both expect time_zone.
  // We keep both for backward compatibility and to satisfy the schema.
  camelisedAirport.time_zone = (airport as Record<string, unknown>).time_zone;

  if (camelisedAirport.city) {
    // Directly mutate the property instead of using Object.assign for better performance
    camelisedAirport.city = cameliseKeys(camelisedAirport.city as object);
  }

  return camelisedAirport as unknown as Airport;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
