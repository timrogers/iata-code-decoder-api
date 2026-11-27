import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as unknown as Airport;

  // Restore time_zone property which is required by the schema and used by the API,
  // but was transformed to timeZone by cameliseKeys.
  // We also ensure all required schema fields are present to avoid serialization errors.
  return {
    ...camelisedAirport,
    time_zone:
      camelisedAirport.time_zone ??
      (camelisedAirport as unknown as { timeZone: string }).timeZone,
    cityName: camelisedAirport.cityName ?? null,
    icaoCode: camelisedAirport.icaoCode ?? null,
    city: camelisedAirport.city
      ? (cameliseKeys(camelisedAirport.city) as Airport['city'])
      : null,
  };
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
