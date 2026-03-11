import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

// Data files are pre-processed with camelCase keys at build time,
// so no runtime transformation is needed.
export const AIRPORTS: Airport[] = AIRPORTS_DATA as Airport[];
