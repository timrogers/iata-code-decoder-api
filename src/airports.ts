import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

const airportDataToAirport = (airport: Record<string, unknown>): Airport => {
  const city = airport.city as Record<string, unknown> | null;

  return {
    id: airport.id as string,
    iataCode: airport.iata_code as string,
    icaoCode: (airport.icao_code as string) ?? null,
    name: airport.name as string,
    latitude: airport.latitude as number,
    longitude: airport.longitude as number,
    timeZone: airport.time_zone as string,
    iataCountryCode: airport.iata_country_code as string,
    cityName: airport.city_name as string,
    city: city
      ? {
          id: city.id as string,
          iataCode: city.iata_code as string,
          iataCountryCode: city.iata_country_code as string,
          name: city.name as string,
        }
      : null,
  };
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = (AIRPORTS_DATA as Record<string, unknown>[]).map(airportDataToAirport);
  }

  return airports;
};
