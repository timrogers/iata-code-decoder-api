import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' assert { type: 'json' };
import { cameliseKeys } from './utils.js';
import { Aircraft as DuffelAircraft } from '@duffel/api';

const aircraftDataToAircraft = (aircraft: DuffelAircraft): Aircraft =>
  cameliseKeys(aircraft) as Aircraft;

export const AIRCRAFT: Aircraft[] = AIRCRAFT_DATA.map(aircraftDataToAircraft);
