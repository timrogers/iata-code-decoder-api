import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

/* eslint-disable @typescript-eslint/no-explicit-any */
const aircraftDataToAircraft = (aircraft: any): Aircraft => {
  return {
    id: aircraft.id,
    iataCode: aircraft.iata_code,
    name: aircraft.name,
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = AIRCRAFT_DATA.map(aircraftDataToAircraft);
  }

  return aircraft;
};
