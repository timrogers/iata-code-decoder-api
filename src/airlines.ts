import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

// Data files are pre-processed with camelCase keys and filtered (no null iataCode)
// at build time, so no runtime transformation is needed.
export const AIRLINES: Airline[] = AIRLINES_DATA as Airline[];
