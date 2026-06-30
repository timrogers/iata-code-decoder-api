import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

const airportDataToAirport = (data: Record<string, unknown>): Airport => {
  const cityData = data.city as Record<string, unknown> | null;
  return {
    id: data.id as string,
    iataCode: data.iata_code as string,
    icaoCode: data.icao_code as string,
    name: data.name as string,
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    time_zone: data.time_zone as string,
    iataCountryCode: data.iata_country_code as string,
    cityName: data.city_name as string,
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
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
