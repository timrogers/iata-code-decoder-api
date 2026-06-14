import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Ensure all required fields for optimized serialization are present
  // Add time_zone for backward compatibility with older clients and schemas
  if (camelisedAirport.timeZone && !camelisedAirport.time_zone) {
    camelisedAirport.time_zone = camelisedAirport.timeZone;
  }

  // Explicitly set null for optional fields to satisfy 'required' schema validation
  camelisedAirport.icaoCode = camelisedAirport.icaoCode ?? null;

  if (camelisedAirport.city) {
    camelisedAirport.city = cameliseKeys(camelisedAirport.city) as Airport['city'];
  } else {
    camelisedAirport.city = null;
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
