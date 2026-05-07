import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

interface RawAircraft {
  iata_code: string;
  id: string;
  name: string;
}

const aircraftDataToAircraft = (aircraft: RawAircraft): Aircraft => ({
  iataCode: aircraft.iata_code,
  id: aircraft.id,
  name: aircraft.name,
});

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    const aircraftData = AIRCRAFT_DATA as RawAircraft[];
    aircraft = aircraftData.map(aircraftDataToAircraft);
  }

  return aircraft;
};
