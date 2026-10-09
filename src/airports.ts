import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

const airportDataToAirport = (airport: Record<string, unknown>): Airport => {
  const city = airport.city as Record<string, unknown> | null;

  return {
    timeZone: airport.time_zone as string,
    name: airport.name as string,
    longitude: airport.longitude as number,
    latitude: airport.latitude as number,
    id: airport.id as string,
    icaoCode: (airport.icao_code as string) ?? null,
    iataCode: airport.iata_code as string,
    iataCountryCode: airport.iata_country_code as string,
    cityName: (airport.city_name as string) ?? null,
    city: city
      ? {
          name: city.name as string,
          id: city.id as string,
          iataCode: city.iata_code as string,
          iataCountryCode: city.iata_country_code as string,
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
