import { Airport, City } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  /**
   * Performance optimization: Direct mutation of the camelized object to include
   * the required time_zone field and update the nested city object.
   * This avoids redundant Object.assign allocations and ensures the object
   * matches the Airport interface and Fastify response schema.
   */
  if (camelisedAirport.city) {
    camelisedAirport.city = cameliseKeys(camelisedAirport.city) as City;
  }

  // Preserve time_zone from the original raw data
  camelisedAirport.time_zone = (airport as Record<string, unknown>).time_zone as string;

  return camelisedAirport;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
