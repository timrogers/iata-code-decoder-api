import { Airport } from './types.js';
import { createRequire } from 'node:module';
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

let airports: Airport[] | undefined;
let airportData: object[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    if (!airportData) {
      const require = createRequire(import.meta.url);
      airportData = require('./../data/airports.json') as object[];
    }

    airports = airportData.map(airportDataToAirport);
  }

  return airports;
};
