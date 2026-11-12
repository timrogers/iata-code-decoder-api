import { Airport } from './types.js';
import { createRequire } from 'node:module';
import { cameliseKeys } from './utils.js';

const require = createRequire(import.meta.url);

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

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    const airportsData = require('../data/airports.json') as object[];
    airports = airportsData.map(airportDataToAirport);
  }

  return airports;
};
