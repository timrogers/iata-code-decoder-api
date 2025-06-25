import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json';
import { cameliseKeys } from './utils.js';

export const AIRCRAFT = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];
