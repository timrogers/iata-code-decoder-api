import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

export const AIRCRAFT = AIRCRAFT_DATA as Aircraft[];
