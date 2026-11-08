import { createRequire } from 'module';
import { Airport } from './types.js';
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
    const data = require('../data/airports.json') as object[];
    airports = data.map(airportDataToAirport);
  }

  return airports;
};
