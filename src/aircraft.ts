import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

// Data files are pre-processed with camelCase keys at build time,
// so no runtime transformation is needed.
export const AIRCRAFT: Aircraft[] = AIRCRAFT_DATA as Aircraft[];
