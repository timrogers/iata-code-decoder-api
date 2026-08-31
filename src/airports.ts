import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

const airportDataToAirport = (data: unknown): Airport => {
  const airport = data as Record<string, unknown>;
  const cityData = airport.city as Record<string, unknown> | null;

  return {
    id: airport.id as string,
    iataCode: airport.iata_code as string,
    icaoCode: (airport.icao_code as string) ?? null,
    name: airport.name as string,
    latitude: airport.latitude as number,
    longitude: airport.longitude as number,
    timeZone: airport.time_zone as string,
    iataCountryCode: airport.iata_country_code as string,
    cityName: (airport.city_name as string) ?? null,
    city: cityData
      ? {
          id: cityData.id as string,
          iataCode: cityData.iata_code as string,
          iataCountryCode: cityData.iata_country_code as string,
          name: cityData.name as string,
        }
      : null,
  };
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = (AIRPORTS_DATA as unknown[]).map(airportDataToAirport);
  }

  return airports;
};
