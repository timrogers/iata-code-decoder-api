import { Aircraft } from './types';
import AIRCRAFT_DATA from './../data/aircraft.json' assert { type: 'json' };
import { cameliseKeys } from './utils';

export const AIRCRAFT = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];
