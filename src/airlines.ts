import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.transformed.json' with { type: 'json' };

// Data is pre-transformed and pre-filtered at build time for better performance
export const AIRLINES: Airline[] = AIRLINES_DATA as Airline[];
