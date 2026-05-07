import { Airport, City } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

interface RawCity {
  id: string;
  iata_code: string;
  iata_country_code: string;
  name: string;
}

interface RawAirport {
  city: RawCity | null;
  city_name: string;
  iata_city_code: string;
  iata_code: string;
  iata_country_code: string;
  icao_code: string | null;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  time_zone: string;
}

const cityDataToCity = (city: RawCity): City =>
  ({
    id: city.id,
    iataCode: city.iata_code,
    iataCountryCode: city.iata_country_code,
    name: city.name,
  }) as City;

const airportDataToAirport = (airport: RawAirport): Airport =>
  ({
    city: airport.city ? cityDataToCity(airport.city) : null,
    cityName: airport.city_name,
    iataCityCode: airport.iata_city_code,
    iataCode: airport.iata_code,
    iataCountryCode: airport.iata_country_code,
    icaoCode: airport.icao_code,
    id: airport.id,
    latitude: airport.latitude,
    longitude: airport.longitude,
    name: airport.name,
    timeZone: airport.time_zone,
  }) as unknown as Airport;

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map((airport) => airportDataToAirport(airport as RawAirport));
  }

  return airports;
};
