import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport & { timeZone?: string };

  // Restore snake_case time_zone for API compatibility and ensure required fields
  const result: Airport = {
    ...camelisedAirport,
    id: camelisedAirport.id ?? null,
    iataCode: camelisedAirport.iataCode ?? null,
    icaoCode: camelisedAirport.icaoCode ?? null,
    name: camelisedAirport.name ?? null,
    latitude: camelisedAirport.latitude ?? null,
    longitude: camelisedAirport.longitude ?? null,
    iataCountryCode: camelisedAirport.iataCountryCode ?? null,
    cityName: camelisedAirport.cityName ?? null,
    time_zone: camelisedAirport.timeZone ?? '',
    city: camelisedAirport.city ? (cameliseKeys(camelisedAirport.city) as City) : null,
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
