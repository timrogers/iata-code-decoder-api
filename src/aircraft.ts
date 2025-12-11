import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';
import { buildIataIndex } from './index-builder.js';

const AIRCRAFT_IATA_CODE_LENGTH = 3;

export const AIRCRAFT = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];

export const AIRCRAFT_INDEX = buildIataIndex(AIRCRAFT, AIRCRAFT_IATA_CODE_LENGTH);
