import { Airline } from './types.js';
// Data is pre-generated with camelCase keys — no runtime transformation needed
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: { iataCode?: string }): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

export const AIRLINES: Airline[] = AIRLINES_DATA.filter(hasIataCode) as Airline[];
