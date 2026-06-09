import { Airport, City } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  // Restore time_zone to satisfy schema and ensure backward compatibility
  // This is faster than using Object.assign or spreading
  camelisedAirport.time_zone = (airport as { time_zone: string }).time_zone;

  if (camelisedAirport.city) {
    camelisedAirport.city = cameliseKeys(camelisedAirport.city) as City;
  }

  return camelisedAirport;
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airports;
};
