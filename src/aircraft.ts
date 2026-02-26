import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { createPrefixIndex, PrefixIndex } from './lookup.js';

export const AIRCRAFT = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];

/** Pre-indexed aircraft for fast IATA code lookup */
export const AIRCRAFT_INDEX: PrefixIndex<Aircraft> = createPrefixIndex(AIRCRAFT, 3);
