import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport & { timeZone?: string };

  /**
   * Fastify response schemas using fast-json-stringify with `required`
   * properties and `additionalProperties: false` require exact alignment
   * with the returned data.
   *
   * 1. Restore `time_zone` property which was transformed to `timeZone` by `cameliseKeys`.
   * 2. Explicitly initialize optional properties to `null` to satisfy `required` constraints.
   */
  const airportResponse: Airport = {
    ...camelisedAirport,
    time_zone: camelisedAirport.time_zone || camelisedAirport.timeZone || '',
    icaoCode: camelisedAirport.icaoCode ?? null,
    cityName: camelisedAirport.cityName ?? null,
    city: camelisedAirport.city ? (cameliseKeys(camelisedAirport.city) as Airport['city']) : null,
  };

  return airportResponse;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
