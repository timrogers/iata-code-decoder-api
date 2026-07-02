import { Airline, Keyable } from './types.js';
import { createRequire } from 'node:module';
import { cameliseKeys } from './utils.js';

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

let airlines: Airline[] | undefined;
let airlineData: object[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    if (!airlineData) {
      const require = createRequire(import.meta.url);
      airlineData = require('./../data/airlines.json') as object[];
    }

    airlines = airlineData.map(cameliseKeys).filter(hasIataCode) as Airline[];
  }

  return airlines;
};
