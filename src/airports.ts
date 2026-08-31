import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

/* eslint-disable @typescript-eslint/no-explicit-any */
const airportDataToAirport = (airport: any): Airport => {
  return {
    id: airport.id,
    iataCode: airport.iata_code,
    icaoCode: airport.icao_code,
    name: airport.name,
    latitude: airport.latitude,
    longitude: airport.longitude,
    timeZone: airport.time_zone,
    iataCountryCode: airport.iata_country_code,
    cityName: airport.city_name,
    city: airport.city
      ? {
          id: airport.city.id,
          iataCode: airport.city.iata_code,
          iataCountryCode: airport.city.iata_country_code,
          name: airport.city.name,
        }
      : null,
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
