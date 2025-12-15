import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { IataCodeIndex } from './index-utils.js';

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

export const AIRPORTS: Airport[] = AIRPORTS_DATA.map(airportDataToAirport);

// Create an index for fast lookups (airport IATA codes are 3 characters)
export const AIRPORT_INDEX = new IataCodeIndex(AIRPORTS, 3);
