import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Optimization: Directly mutate the newly created camelized object
  // and handle the required 'time_zone' field for backward compatibility.
  if (camelisedAirport.city) {
    camelisedAirport.city = cameliseKeys(camelisedAirport.city) as Airport['city'];
  }

  // Ensure time_zone is present if required by schema, although cameliseKeys
  // would have turned it into timeZone.
  const raw = airport as Record<string, unknown>;
  if (raw.time_zone && !camelisedAirport.time_zone) {
    camelisedAirport.time_zone = raw.time_zone as string;
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
