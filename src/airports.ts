import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Restore the original snake_case time_zone field which is required by the
  // schema, while also keeping the camelCase version for future-proofing.
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
