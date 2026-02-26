import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { createPrefixIndex, PrefixIndex } from './lookup.js';

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

/** Pre-indexed airports for fast IATA code lookup */
export const AIRPORTS_INDEX: PrefixIndex<Airport> = createPrefixIndex(AIRPORTS, 3);
