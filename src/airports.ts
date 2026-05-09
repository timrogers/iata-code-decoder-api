import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as unknown as Airport;

  // Restore the original time_zone for the schema and backward compatibility,
  // and ensure city is also camelised if it exists.
  camelisedAirport.time_zone = (airport as Record<string, unknown>).time_zone as string;

  if (camelisedAirport.city) {
    camelisedAirport.city = cameliseKeys(
      camelisedAirport.city as unknown as object,
    ) as Airport['city'];
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
