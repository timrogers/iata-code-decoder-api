import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.transformed.json' with { type: 'json' };

// Data is pre-transformed at build time for better performance
export const AIRCRAFT = AIRCRAFT_DATA as Aircraft[];
