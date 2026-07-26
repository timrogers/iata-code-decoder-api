import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport & { timeZone?: string };

  // Explicitly restore snake_case 'time_zone' for schema compliance,
  // as cameliseKeys transforms it to 'timeZone'.
  if (camelisedAirport.timeZone !== undefined) {
    camelisedAirport.time_zone = camelisedAirport.timeZone;
  }

  // Ensure all required fields for airportSchema are initialized
  const result: Airport = {
    id: camelisedAirport.id ?? '',
    iataCode: camelisedAirport.iataCode ?? '',
    icaoCode: camelisedAirport.icaoCode ?? null,
    name: camelisedAirport.name ?? '',
    latitude: camelisedAirport.latitude ?? 0,
    longitude: camelisedAirport.longitude ?? 0,
    time_zone: camelisedAirport.time_zone ?? '',
    iataCountryCode: camelisedAirport.iataCountryCode ?? '',
    cityName: camelisedAirport.cityName ?? '',
    city: null,
  };

  if (camelisedAirport.city) {
    const camelisedCity = cameliseKeys(camelisedAirport.city) as any;
    result.city = {
      id: camelisedCity.id ?? '',
      iataCode: camelisedCity.iataCode ?? '',
      iataCountryCode: camelisedCity.iataCountryCode ?? '',
      name: camelisedCity.name ?? '',
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
