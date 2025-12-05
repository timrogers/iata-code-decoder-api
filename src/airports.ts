import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { buildIataIndex } from './index-builder.js';

const AIRPORT_IATA_CODE_LENGTH = 3;

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

export const AIRPORTS_INDEX = buildIataIndex(AIRPORTS, AIRPORT_IATA_CODE_LENGTH);
