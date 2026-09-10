import { createRequire } from 'module';
import { Airline, Keyable } from './types.js';
import { cameliseKeys } from './utils.js';

const require = createRequire(import.meta.url);

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    const AIRLINES_DATA: object[] = require('./../data/airlines.json');
    airlines = AIRLINES_DATA.map(cameliseKeys).filter(hasIataCode) as Airline[];
  }

  return airlines;
};
