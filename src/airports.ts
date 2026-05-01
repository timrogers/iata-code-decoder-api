import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const raw = airport as Record<string, unknown>;
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Preserve time_zone to match what's expected in the Airport interface
  // and maintain backward compatibility.
  camelisedAirport.time_zone = raw.time_zone as string;
  camelisedAirport.timeZone = raw.time_zone as string;

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
