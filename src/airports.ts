import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // The 'time_zone' property is required by our Fastify schema for optimized
  // serialization. Since 'cameliseKeys' transforms 'time_zone' to 'timeZone',
  // we manually restore the snake_case version here.
  // We also ensure that optional fields like 'icaoCode' and 'city' are
  // explicitly null if missing, to satisfy the strict schema.
  const result = {
    ...camelisedAirport,
    time_zone: (airport as Record<string, unknown>).time_zone as string,
    icaoCode: camelisedAirport.icaoCode ?? null,
    city: camelisedAirport.city ? (cameliseKeys(camelisedAirport.city) as Airport['city']) : null,
    cityName: camelisedAirport.cityName ?? null,
  } as Airport;

  return result;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
