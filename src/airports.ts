import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as unknown as Airport;

  // Add back time_zone for backward compatibility, as cameliseKeys converts it to timeZone
  if (!camelisedAirport.time_zone && (airport as Record<string, unknown>).time_zone) {
    camelisedAirport.time_zone = (airport as Record<string, unknown>).time_zone as string;
  }

  // Ensure all required fields for strict schema are present (at least null)
  const result: Airport = {
    ...camelisedAirport,
    icaoCode: camelisedAirport.icaoCode ?? null,
    city: camelisedAirport.city
      ? (cameliseKeys(camelisedAirport.city) as Airport['city'])
      : null,
  };

  return result;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
