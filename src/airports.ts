import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.transformed.json' with { type: 'json' };

// Data is pre-transformed at build time for better performance
export const AIRPORTS: Airport[] = AIRPORTS_DATA as Airport[];
