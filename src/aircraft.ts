import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

const aircraftDataToAircraft = (aircraft: Record<string, unknown>): Aircraft => {
  return {
    id: aircraft.id as string,
    iataCode: aircraft.iata_code as string,
    name: aircraft.name as string,
  };
};

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = (AIRCRAFT_DATA as Record<string, unknown>[]).map(aircraftDataToAircraft);
  }

  return aircraft;
};
