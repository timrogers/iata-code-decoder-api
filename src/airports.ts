import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    }) as Airport;
  } else {
    return camelisedAirport as Airport;
  }
};

let airportsCache: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airportsCache) {
    airportsCache = AIRPORTS_DATA.map(airportDataToAirport);
  }

  return airportsCache;
};
