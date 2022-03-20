import { Aircraft } from './types';
import AIRCRAFT_DATA from './../data/aircraft.json';
import { cameliseKeys } from './utils';
import { Aircraft as DuffelAircraft } from '@duffel/api';

const aircraftDataToAircraft = (aircraft: DuffelAircraft): Aircraft =>
  cameliseKeys(aircraft) as Aircraft;

export const AIRCRAFT: Aircraft[] = AIRCRAFT_DATA.map(aircraftDataToAircraft);
