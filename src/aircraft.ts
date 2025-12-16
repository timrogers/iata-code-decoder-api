import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { IataCodeIndex } from './index-utils.js';

export const AIRCRAFT = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];

// Aircraft IATA codes are 3 characters
export const AIRCRAFT_INDEX = new IataCodeIndex(AIRCRAFT, 3);
