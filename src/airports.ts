import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelised = cameliseKeys(airport) as Airport & { timeZone?: string };

  const result: Airport = {
    id: camelised.id,
    iataCode: camelised.iataCode,
    icaoCode: camelised.icaoCode ?? null,
    name: camelised.name,
    latitude: camelised.latitude,
    longitude: camelised.longitude,
    time_zone: camelised.timeZone || camelised.time_zone,
    iataCountryCode: camelised.iataCountryCode,
    cityName: camelised.cityName ?? null,
    city: camelised.city
      ? (cameliseKeys(camelised.city) as unknown as Airport['city'])
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
