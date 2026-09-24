import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Preserve time_zone for backward compatibility as the schema requires it
  if ((airport as Record<string, unknown>).time_zone) {
    camelisedAirport.time_zone = (airport as Record<string, unknown>).time_zone as string;
  }

  if (camelisedAirport.city) {
    // Direct mutation of the camelised object is faster than Object.assign
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
