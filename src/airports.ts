import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // We ensure both time_zone and timeZone are present for backward compatibility
  // and to satisfy the optimized Fastify response schema.
  camelisedAirport.time_zone = (airport as { time_zone: string }).time_zone;

  if (camelisedAirport.city) {
    camelisedAirport.city = cameliseKeys(camelisedAirport.city) as Airport['city'];
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
