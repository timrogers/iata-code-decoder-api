import { Airline, Keyable } from './types.js';
import AIRLINES_DATA from './../data/airlines.json';
import { cameliseKeys } from './utils.js';

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

export const AIRLINES: Airline[] = AIRLINES_DATA.map(cameliseKeys).filter(
  hasIataCode,
) as Airline[];
