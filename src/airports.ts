import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };

export const AIRPORTS: Airport[] = AIRPORTS_DATA as Airport[];
