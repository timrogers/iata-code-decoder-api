import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport & { timeZone?: string };

  // Restore the snake_case time_zone property which is transformed by cameliseKeys
  if (camelisedAirport.timeZone) {
    camelisedAirport.time_zone = camelisedAirport.timeZone;
  }

  // Ensure all required fields from airportSchema are present for optimized serialization
  const result: Airport = {
    id: camelisedAirport.id,
    iataCode: camelisedAirport.iataCode,
    icaoCode: camelisedAirport.icaoCode ?? null,
    name: camelisedAirport.name,
    latitude: camelisedAirport.latitude,
    longitude: camelisedAirport.longitude,
    time_zone: camelisedAirport.time_zone,
    iataCountryCode: camelisedAirport.iataCountryCode,
    cityName: camelisedAirport.cityName ?? null,
    city: null,
  };

  if (camelisedAirport.city) {
    const camelisedCity = cameliseKeys(camelisedAirport.city) as any;
    result.city = {
      id: camelisedCity.id,
      iataCode: camelisedCity.iataCode,
      iataCountryCode: camelisedCity.iataCountryCode,
      name: camelisedCity.name,
    };
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
