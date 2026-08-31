import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const airportMap = airport as Record<string, unknown>;
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Ensure timeZone and handle icaoCode being potentially null
  const result = {
    ...camelisedAirport,
    timeZone: (airportMap.time_zone as string) ?? '',
    icaoCode: (airportMap.icao_code as string | null) ?? null,
  } as Airport;

  if (result.city) {
    result.city = cameliseKeys(result.city) as Airport['city'];
  }

  return result;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
